// Package services provides the in-memory vector store and similarity engine
// for the ShopHub AI recommendation service.
//
// Architecture notes:
//   - Products are stored in a Go map keyed by product ID.
//   - All read/write access is protected by a sync.RWMutex (many-readers / one-writer).
//   - Cosine similarity is used for ranking:
//       sim(A, B) = (A · B) / (‖A‖ · ‖B‖)
//     Because both stored vectors and query vectors are L2-normalised by the
//     EmbeddingService, the dot product equals the cosine similarity directly.
//   - The store can optionally pad/truncate vectors at retrieval time to handle
//     vocabulary growth (new tokens added after a product was stored).
package services

import (
	"math"
	"sort"
	"sync"

	"ai-service-golang/models"
)

// ─────────────────────────────────────────────────────────────────────────────
// VectorStore
// ─────────────────────────────────────────────────────────────────────────────

// VectorStore is a thread-safe in-memory store that maps product IDs to their
// vector representations and metadata.
type VectorStore struct {
	mu       sync.RWMutex
	products map[int]*models.ProductVector
	// insertion-order slice for deterministic iteration
	ids []int
}

// NewVectorStore initialises and returns an empty VectorStore.
func NewVectorStore() *VectorStore {
	return &VectorStore{
		products: make(map[int]*models.ProductVector),
		ids:      []int{},
	}
}

// Upsert adds a new product vector or replaces an existing one.
func (vs *VectorStore) Upsert(pv *models.ProductVector) {
	vs.mu.Lock()
	defer vs.mu.Unlock()

	if _, exists := vs.products[pv.ProductID]; !exists {
		vs.ids = append(vs.ids, pv.ProductID)
	}
	vs.products[pv.ProductID] = pv
}

// Get returns a product vector by ID.  Returns nil if not found.
func (vs *VectorStore) Get(id int) *models.ProductVector {
	vs.mu.RLock()
	defer vs.mu.RUnlock()
	return vs.products[id]
}

// Count returns the number of stored product vectors.
func (vs *VectorStore) Count() int {
	vs.mu.RLock()
	defer vs.mu.RUnlock()
	return len(vs.products)
}

// All returns a snapshot of all stored ProductVectors (safe copy of values).
func (vs *VectorStore) All() []*models.ProductVector {
	vs.mu.RLock()
	defer vs.mu.RUnlock()

	result := make([]*models.ProductVector, 0, len(vs.ids))
	for _, id := range vs.ids {
		if pv, ok := vs.products[id]; ok {
			result = append(result, pv)
		}
	}
	return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Cosine Similarity
// ─────────────────────────────────────────────────────────────────────────────

// CosineSimilarity computes the cosine similarity between two vectors.
//
//	sim(A, B) = (A · B) / (‖A‖ · ‖B‖)
//
// Vectors are aligned by the shorter dimension; excess components in the longer
// vector contribute to its norm but not the dot product (they remain unseen).
// This gracefully handles vocabulary growth between stored and query vectors.
func CosineSimilarity(a, b []float64) float64 {
	if len(a) == 0 || len(b) == 0 {
		return 0.0
	}

	minLen := len(a)
	if len(b) < minLen {
		minLen = len(b)
	}

	dot := 0.0
	normA := 0.0
	normB := 0.0

	for i := 0; i < minLen; i++ {
		dot += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	// Include remaining components of the longer vector in its norm
	for i := minLen; i < len(a); i++ {
		normA += a[i] * a[i]
	}
	for i := minLen; i < len(b); i++ {
		normB += b[i] * b[i]
	}

	denom := math.Sqrt(normA) * math.Sqrt(normB)
	if denom == 0 {
		return 0.0
	}
	return dot / denom
}

// ─────────────────────────────────────────────────────────────────────────────
// ScoredProduct — sortable result
// ─────────────────────────────────────────────────────────────────────────────

// ScoredProduct pairs a ProductVector with its similarity score.
type ScoredProduct struct {
	PV    *models.ProductVector
	Score float64
}

// ─────────────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────────────

// Search ranks all stored product vectors against a query vector using cosine
// similarity and returns up to `limit` results whose score exceeds `minScore`.
// Results are returned in descending score order.
func (vs *VectorStore) Search(queryVec []float64, limit int, minScore float64) []ScoredProduct {
	all := vs.All() // snapshot — no lock held during scoring

	scored := make([]ScoredProduct, 0, len(all))
	for _, pv := range all {
		sim := CosineSimilarity(queryVec, pv.Vector)
		if sim >= minScore {
			scored = append(scored, ScoredProduct{PV: pv, Score: sim})
		}
	}

	// Sort descending by similarity score, then by product ID as a tie-breaker
	sort.Slice(scored, func(i, j int) bool {
		if scored[i].Score != scored[j].Score {
			return scored[i].Score > scored[j].Score
		}
		return scored[i].PV.ProductID < scored[j].PV.ProductID
	})

	if limit > 0 && len(scored) > limit {
		scored = scored[:limit]
	}
	return scored
}

