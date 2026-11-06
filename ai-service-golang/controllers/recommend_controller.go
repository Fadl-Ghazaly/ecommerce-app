package controllers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"

	"ai-service-golang/config"
	"ai-service-golang/models"
	"ai-service-golang/services"

	"github.com/gin-gonic/gin"
)

// RecommendController handles AI-powered product recommendation requests.
type RecommendController struct {
	Embedding   *services.EmbeddingService
	VectorStore *services.VectorStore
}

// NewRecommendController creates a new RecommendController.
func NewRecommendController(emb *services.EmbeddingService, vs *services.VectorStore) *RecommendController {
	return &RecommendController{
		Embedding:   emb,
		VectorStore: vs,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/recommend
// ─────────────────────────────────────────────────────────────────────────────

// Recommend handles POST /api/recommend
//
// Expected JSON body:
//
//	{
//	    "query": "rekomendasi headset terbaik",
//	    "limit": 4
//	}
func (rc *RecommendController) Recommend(c *gin.Context) {
	var req models.RecommendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": fmt.Sprintf("Invalid request body: %s", err.Error()),
		})
		return
	}

	// Default and clamp limit
	limit := req.Limit
	if limit <= 0 {
		limit = 4
	}
	if limit > 20 {
		limit = 20
	}

	// Guard: vector store must have products
	if rc.VectorStore.Count() == 0 {
		c.JSON(http.StatusOK, models.RecommendResponse{
			Status:    "success",
			AIMessage: "Belum ada produk yang terindeks. Silakan tambahkan produk terlebih dahulu.",
			Query:     req.Query,
			Products:  []models.ProductScore{},
		})
		return
	}

	// Embed the query using existing vocabulary (read-only — no new tokens added)
	queryVec := rc.Embedding.EmbedQuery(req.Query)

	// Perform vector similarity search
	minScore := config.App.MinSimilarityScore
	results := rc.VectorStore.Search(queryVec, limit, minScore)

	// Map to response DTO
	productScores := make([]models.ProductScore, 0, len(results))
	for _, r := range results {
		productScores = append(productScores, models.ProductScore{
			ProductID:   r.PV.ProductID,
			Name:        r.PV.Name,
			Category:    r.PV.Category,
			Description: truncate(r.PV.Description, 120),
			Price:       r.PV.Price,
			Score:       roundTo(r.Score, 4),
		})
	}

	// Generate a contextual, friendly AI message
	aiMsg := buildAIMessage(req.Query, productScores)

	c.JSON(http.StatusOK, models.RecommendResponse{
		Status:    "success",
		AIMessage: aiMsg,
		Query:     req.Query,
		Products:  productScores,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/recommend/popular
// ─────────────────────────────────────────────────────────────────────────────

// Popular handles GET /api/recommend/popular — returns a random selection of
// indexed products as "popular" items when no query context is available.
func (rc *RecommendController) Popular(c *gin.Context) {
	all := rc.VectorStore.All()
	if len(all) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"status":   "success",
			"message":  "Belum ada produk yang terindeks.",
			"products": []models.ProductScore{},
		})
		return
	}

	// Shuffle for variety
	shuffled := make([]*models.ProductVector, len(all))
	copy(shuffled, all)
	rand.Shuffle(len(shuffled), func(i, j int) { shuffled[i], shuffled[j] = shuffled[j], shuffled[i] })

	limit := 6
	if len(shuffled) < limit {
		limit = len(shuffled)
	}

	products := make([]models.ProductScore, 0, limit)
	for _, pv := range shuffled[:limit] {
		products = append(products, models.ProductScore{
			ProductID:   pv.ProductID,
			Name:        pv.Name,
			Category:    pv.Category,
			Description: truncate(pv.Description, 120),
			Price:       pv.Price,
			Score:       1.0,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"message":  "Produk populer untuk Anda.",
		"products": products,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Message Generator
// ─────────────────────────────────────────────────────────────────────────────

// aiMessageTemplates provides varied, friendly AI response openers.
var aiMessageTemplates = []string{
	"Berikut adalah rekomendasi produk terbaik berdasarkan pencarian Anda!",
	"Hei! Saya menemukan beberapa produk yang cocok dengan kebutuhan Anda.",
	"Berdasarkan pencarian Anda, inilah pilihan produk yang kami rekomendasikan.",
	"Saya telah memilihkan produk-produk terbaik yang sesuai dengan kebutuhan Anda!",
	"Berikut ini adalah produk-produk pilihan yang relevan dengan pencarian Anda.",
}

var noResultsTemplate = "Maaf, saya tidak menemukan produk yang cocok dengan pencarian \"%s\". Coba kata kunci yang berbeda atau lebih umum."

// buildAIMessage generates a contextual message for the recommendation response.
func buildAIMessage(query string, products []models.ProductScore) string {
	if len(products) == 0 {
		return fmt.Sprintf(noResultsTemplate, query)
	}

	// Pick a random opener
	opener := aiMessageTemplates[rand.Intn(len(aiMessageTemplates))]

	// Add context hint if the top score is high
	if products[0].Score > 0.7 {
		return opener + fmt.Sprintf(" Saya sangat yakin produk \"%s\" sangat relevan untuk Anda! 🎯", products[0].Name)
	}

	// Extract category variety
	cats := uniqueCategories(products)
	if len(cats) > 1 {
		return opener + fmt.Sprintf(" Saya menemukan produk dari %d kategori berbeda yang mungkin Anda sukai.", len(cats))
	}

	return opener
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

func truncate(s string, maxChars int) string {
	runes := []rune(strings.TrimSpace(s))
	if len(runes) <= maxChars {
		return string(runes)
	}
	return string(runes[:maxChars]) + "…"
}

func roundTo(val float64, decimals int) float64 {
	pow := 1.0
	for i := 0; i < decimals; i++ {
		pow *= 10
	}
	return float64(int(val*pow+0.5)) / pow
}

func uniqueCategories(products []models.ProductScore) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, p := range products {
		if !seen[p.Category] {
			seen[p.Category] = true
			out = append(out, p.Category)
		}
	}
	return out
}

