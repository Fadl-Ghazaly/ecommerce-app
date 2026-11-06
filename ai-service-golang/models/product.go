package models

// ProductPayload is the struct for the JSON payload received from Laravel's ProductObserver.
// POST /api/vectorize
type ProductPayload struct {
	ID          int     `json:"id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

// ProductVector stores a product's vectorized representation in the in-memory store.
type ProductVector struct {
	ProductID   int
	Name        string
	Category    string
	Description string
	Price       float64
	Vector      []float64 // TF-IDF style term-frequency embedding vector
	TextContent string    // Concatenated raw text used for embedding
}

// VectorizeResponse is the JSON response for POST /api/vectorize.
type VectorizeResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	ProductID int    `json:"product_id"`
}

