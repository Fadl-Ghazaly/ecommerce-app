// Package services provides the text embedding engine for the ShopHub AI service.
//
// This implements a TF-IDF inspired term-frequency vectorizer that:
//  1. Normalises and tokenises Indonesian + English product text.
//  2. Builds a shared vocabulary across the entire vector store.
//  3. Produces a dense float64 vector for every product and every query.
//
// The design is intentionally self-contained (no external ML runtime dependency)
// so the service stays a single, light binary that can be swapped for a Gemini
// embedding API call in production by replacing only the Embed() function.
package services

import (
	"math"
	"sort"
	"strings"
	"sync"
	"unicode"
)

// ─────────────────────────────────────────────────────────────────────────────
// Stop-word list (Indonesian + common English)
// ─────────────────────────────────────────────────────────────────────────────

var stopWords = map[string]bool{
	// Indonesian
	"yang": true, "dan": true, "di": true, "ke": true, "dari": true,
	"untuk": true, "adalah": true, "ini": true, "itu": true, "dengan": true,
	"pada": true, "tidak": true, "juga": true, "dalam": true, "akan": true,
	"ada": true, "bisa": true, "atau": true, "oleh": true, "sudah": true,
	"serta": true, "lebih": true, "jadi": true, "karena": true, "sangat": true,
	"telah": true, "seperti": true, "sebuah": true, "nya": true, "pun": true,
	"agar": true, "hingga": true, "namun": true, "bila": true, "kalau": true,
	// English
	"the": true, "is": true, "are": true, "and": true, "or": true,
	"a": true, "an": true, "in": true, "of": true, "to": true,
	"for": true, "with": true, "this": true, "that": true, "it": true,
	"on": true, "at": true, "by": true, "as": true, "be": true,
	"from": true, "can": true, "has": true, "have": true, "not": true,
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary — global shared token index
// ─────────────────────────────────────────────────────────────────────────────

// Vocabulary manages a thread-safe mapping of token → vector dimension index.
type Vocabulary struct {
	mu      sync.RWMutex
	tokens  map[string]int // token → index
	ordered []string       // index → token (keeps dimension order stable)
}

func newVocabulary() *Vocabulary {
	return &Vocabulary{
		tokens:  make(map[string]int),
		ordered: []string{},
	}
}

// Add inserts a token if it is not already present and returns its index.
func (v *Vocabulary) Add(token string) int {
	v.mu.Lock()
	defer v.mu.Unlock()
	if idx, ok := v.tokens[token]; ok {
		return idx
	}
	idx := len(v.ordered)
	v.tokens[token] = idx
	v.ordered = append(v.ordered, token)
	return idx
}

// Index returns the index of a known token; -1 if unknown.
func (v *Vocabulary) Index(token string) int {
	v.mu.RLock()
	defer v.mu.RUnlock()
	if idx, ok := v.tokens[token]; ok {
		return idx
	}
	return -1
}

// Size returns the current vocabulary dimension.
func (v *Vocabulary) Size() int {
	v.mu.RLock()
	defer v.mu.RUnlock()
	return len(v.ordered)
}

// ─────────────────────────────────────────────────────────────────────────────
// EmbeddingService
// ─────────────────────────────────────────────────────────────────────────────

// EmbeddingService converts raw product text into dense float64 vectors using a
// shared Vocabulary and TF-IDF inspired term-frequency scoring.
type EmbeddingService struct {
	Vocab *Vocabulary
}

// NewEmbeddingService creates a new EmbeddingService with an empty vocabulary.
func NewEmbeddingService() *EmbeddingService {
	return &EmbeddingService{
		Vocab: newVocabulary(),
	}
}

// Tokenize normalises text, splits into tokens, removes stop-words, and applies
// basic stemming (suffix stripping for Bahasa Indonesia and English).
func (e *EmbeddingService) Tokenize(text string) []string {
	// Lower-case + replace punctuation with spaces
	var sb strings.Builder
	for _, r := range strings.ToLower(text) {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			sb.WriteRune(r)
		} else {
			sb.WriteRune(' ')
		}
	}

	parts := strings.Fields(sb.String())
	seen := map[string]bool{}
	out := make([]string, 0, len(parts))

	for _, p := range parts {
		if len(p) < 2 {
			continue
		}
		if stopWords[p] {
			continue
		}
		stem := basicStem(p)
		if stem == "" || seen[stem] {
			continue
		}
		seen[stem] = true
		out = append(out, stem)
	}
	return out
}

// basicStem strips common Indonesian and English suffixes for a rough stem.
func basicStem(word string) string {
	suffixes := []string{
		// Indonesian
		"kan", "an", "nya", "lah", "kah", "pun",
		"me", "di", "ke", "se", "ter", "ber", "per",
		// English
		"ing", "tion", "ness", "ment", "ity", "er", "ed", "ly", "es", "s",
	}
	// Sort by length descending so longest suffix matches first
	sort.Slice(suffixes, func(i, j int) bool { return len(suffixes[i]) > len(suffixes[j]) })
	for _, suf := range suffixes {
		if strings.HasSuffix(word, suf) && len(word)-len(suf) >= 3 {
			return word[:len(word)-len(suf)]
		}
	}
	return word
}

// Embed converts a raw text string into a normalised float64 term-frequency vector.
// New tokens are added to the shared vocabulary, extending the vector dimension.
func (e *EmbeddingService) Embed(text string) []float64 {
	tokens := e.Tokenize(text)
	if len(tokens) == 0 {
		return []float64{}
	}

	// Count term-frequencies in this document
	tf := make(map[int]float64)
	for _, t := range tokens {
		idx := e.Vocab.Add(t)
		tf[idx]++
	}

	// Build a sparse-then-dense vector over the full vocabulary dimension
	dim := e.Vocab.Size()
	vec := make([]float64, dim)
	for idx, count := range tf {
		if idx < dim {
			// Log-normalised TF: 1 + log(tf)
			vec[idx] = 1.0 + math.Log(count)
		}
	}

	return normalise(vec)
}

// EmbedQuery converts a query string into a vector aligned with the existing vocabulary
// WITHOUT extending it (unknown query tokens are simply ignored).
func (e *EmbeddingService) EmbedQuery(query string) []float64 {
	tokens := e.Tokenize(query)
	if len(tokens) == 0 {
		return []float64{}
	}

	dim := e.Vocab.Size()
	if dim == 0 {
		return []float64{}
	}

	tf := make(map[int]float64)
	for _, t := range tokens {
		idx := e.Vocab.Index(t)
		if idx >= 0 {
			tf[idx]++
		}
	}

	vec := make([]float64, dim)
	for idx, count := range tf {
		if idx < dim {
			vec[idx] = 1.0 + math.Log(count)
		}
	}

	return normalise(vec)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// normalise converts a raw frequency vector to a unit L2 vector.
func normalise(vec []float64) []float64 {
	norm := 0.0
	for _, v := range vec {
		norm += v * v
	}
	if norm == 0 {
		return vec
	}
	norm = math.Sqrt(norm)
	out := make([]float64, len(vec))
	for i, v := range vec {
		out[i] = v / norm
	}
	return out
}

