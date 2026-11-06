package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"ai-service-golang/models"
	"ai-service-golang/services"

	"github.com/gin-gonic/gin"
)

// VectorizeController handles requests to the /api/vectorize endpoint.
// It receives product data from the Laravel ProductObserver, generates a text
// embedding, and upserts the vector into the in-memory VectorStore.
type VectorizeController struct {
	Embedding   *services.EmbeddingService
	VectorStore *services.VectorStore
}

// NewVectorizeController creates a new VectorizeController with the given
// shared EmbeddingService and VectorStore.
func NewVectorizeController(emb *services.EmbeddingService, vs *services.VectorStore) *VectorizeController {
	return &VectorizeController{
		Embedding:   emb,
		VectorStore: vs,
	}
}

// Vectorize handles POST /api/vectorize
//
// Expected JSON body:
//
//	{
//	    "id":          1,
//	    "name":        "Wireless Headphone Bluetooth 5.3",
//	    "category":    "Elektronik",
//	    "description": "Headphone nirkabel suara jernih bass mantap",
//	    "price":       299000
//	}
func (vc *VectorizeController) Vectorize(c *gin.Context) {
	var payload models.ProductPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": fmt.Sprintf("Invalid request payload: %s", err.Error()),
		})
		return
	}

	// Build enriched text content: name + category + description
	// Weight the name and category more heavily by repeating them.
	textContent := buildTextContent(payload)

	// Generate embedding vector
	vector := vc.Embedding.Embed(textContent)

	// Upsert into the vector store
	pv := &models.ProductVector{
		ProductID:   payload.ID,
		Name:        payload.Name,
		Category:    payload.Category,
		Description: payload.Description,
		Price:       payload.Price,
		Vector:      vector,
		TextContent: textContent,
	}
	vc.VectorStore.Upsert(pv)

	c.JSON(http.StatusOK, models.VectorizeResponse{
		Status:    "success",
		Message:   "Product vector stored successfully",
		ProductID: payload.ID,
	})
}

// StoreStats handles GET /api/vectorize/stats — returns vector store health info.
func (vc *VectorizeController) StoreStats(c *gin.Context) {
	total := vc.VectorStore.Count()
	vocabSize := vc.Embedding.Vocab.Size()

	c.JSON(http.StatusOK, gin.H{
		"status":        "success",
		"total_vectors": total,
		"vocab_size":    vocabSize,
		"message":       fmt.Sprintf("%d product vectors indexed, vocabulary dimension: %d", total, vocabSize),
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// buildTextContent constructs weighted text from product fields.
// Name and category are repeated to increase their TF weight in the final vector.
func buildTextContent(p models.ProductPayload) string {
	parts := []string{
		strings.TrimSpace(p.Name),     // weight × 1
		strings.TrimSpace(p.Name),     // weight × 2 (repeat)
		strings.TrimSpace(p.Category), // weight × 1
		strings.TrimSpace(p.Category), // weight × 2 (repeat)
		strings.TrimSpace(p.Description),
	}
	return strings.Join(parts, " ")
}

