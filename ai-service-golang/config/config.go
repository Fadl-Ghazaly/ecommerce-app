package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// AppConfig holds all application configuration loaded from environment variables.
type AppConfig struct {
	AppEnv              string
	AppPort             string
	VectorStoreMax      int
	MinSimilarityScore  float64
	GeminiAPIKey        string
	CORSAllowedOrigins  []string
}

var App *AppConfig

// Load reads .env file (if present) then parses env vars into the AppConfig struct.
func Load() {
	// Load .env file — silent fail in production where env vars are injected externally
	if err := godotenv.Load(); err != nil {
		log.Println("[Config] .env file not found, reading from system environment")
	}

	maxStore, _ := strconv.Atoi(getEnv("VECTOR_STORE_MAX", "10000"))
	minScore, _ := strconv.ParseFloat(getEnv("MIN_SIMILARITY_SCORE", "0.05"), 64)

	originsRaw := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:8000,http://localhost:5173,http://localhost:3000")
	origins := strings.Split(originsRaw, ",")
	for i, o := range origins {
		origins[i] = strings.TrimSpace(o)
	}

	App = &AppConfig{
		AppEnv:             getEnv("APP_ENV", "development"),
		AppPort:            getEnv("APP_PORT", "8080"),
		VectorStoreMax:     maxStore,
		MinSimilarityScore: minScore,
		GeminiAPIKey:       getEnv("GEMINI_API_KEY", ""),
		CORSAllowedOrigins: origins,
	}

	log.Printf("[Config] Loaded — env=%s, port=%s, maxVectors=%d", App.AppEnv, App.AppPort, App.VectorStoreMax)
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

