package models

// RecommendRequest is the JSON body for POST /api/recommend.
type RecommendRequest struct {
	Query string `json:"query" binding:"required"`
	Limit int    `json:"limit"`
}

// ProductScore is a scored product returned in a recommendation response.
type ProductScore struct {
	ProductID   int     `json:"product_id"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Score       float64 `json:"score"`
}

// RecommendResponse is the full JSON response for POST /api/recommend.
type RecommendResponse struct {
	Status    string         `json:"status"`
	AIMessage string         `json:"ai_message"`
	Query     string         `json:"query"`
	Products  []ProductScore `json:"products"`
}

// StoreStatsResponse returns current vector store statistics.
type StoreStatsResponse struct {
	Status       string `json:"status"`
	TotalVectors int    `json:"total_vectors"`
	Message      string `json:"message"`
}

// HealthResponse is the response for GET /health.
type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

