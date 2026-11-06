// ShopHub AI Service — main.go
//
// Entry point for the Golang AI microservice.
// Responsibilities:
//   - Load configuration from environment / .env file.
//   - Initialise shared singletons (EmbeddingService, VectorStore).
//   - Register Gin HTTP routes.
//   - Start the HTTP server on the configured port (default 8080).
package main

import (
	"log"
	"net/http"
	"strings"
	"time"

	"ai-service-golang/config"
	"ai-service-golang/controllers"
	"ai-service-golang/models"
	"ai-service-golang/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// ── 1. Configuration ────────────────────────────────────────────────────
	config.Load()

	// ── 2. Shared singletons ────────────────────────────────────────────────
	embeddingService := services.NewEmbeddingService()
	vectorStore := services.NewVectorStore()

	// Pre-seed the store with a few representative products so the service
	// is immediately functional even without a running Laravel backend.
	seedSampleProducts(embeddingService, vectorStore)

	// ── 3. Controllers ──────────────────────────────────────────────────────
	vectorizeCtrl := controllers.NewVectorizeController(embeddingService, vectorStore)
	recommendCtrl := controllers.NewRecommendController(embeddingService, vectorStore)

	// ── 4. Gin engine ───────────────────────────────────────────────────────
	if config.App.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS — allow configured origins + all in development
	r.Use(cors.New(cors.Config{
		AllowOrigins:     config.App.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ── 5. Routes ───────────────────────────────────────────────────────────

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, models.HealthResponse{
			Status:  "ok",
			Service: "ShopHub AI Service",
			Version: "1.0.0",
		})
	})

	// API v1
	api := r.Group("/api")
	{
		// Vectorization endpoints (called by Laravel ProductObserver)
		api.POST("/vectorize", vectorizeCtrl.Vectorize)
		api.GET("/vectorize/stats", vectorizeCtrl.StoreStats)

		// Recommendation endpoints (called by React frontend / AI Chat widget)
		api.POST("/recommend", recommendCtrl.Recommend)
		api.GET("/recommend/popular", recommendCtrl.Popular)
	}

	// 404 handler
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Endpoint not found. Please refer to the API documentation.",
		})
	})

	// ── 6. Start server ─────────────────────────────────────────────────────
	addr := ":" + config.App.AppPort
	log.Printf("🚀 ShopHub AI Service running on http://localhost%s  (env=%s)", addr, config.App.AppEnv)
	log.Printf("   Vector store pre-seeded with %d products.", vectorStore.Count())
	log.Printf("   Endpoints: POST /api/vectorize | POST /api/recommend | GET /api/recommend/popular")

	if err := r.Run(addr); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Development seed data
// ─────────────────────────────────────────────────────────────────────────────

type seedItem struct {
	id          int
	name        string
	category    string
	description string
	price       float64
}

// seedSampleProducts populates the vector store so the AI recommendation
// endpoint returns meaningful results even before Laravel sends any products.
func seedSampleProducts(emb *services.EmbeddingService, vs *services.VectorStore) {
	samples := []seedItem{
		{
			id: 1, name: "Wireless Noise Cancelling Headphones Pro",
			category: "Elektronik & Gadget",
			description: "Headphone Bluetooth nirkabel premium dengan fitur Active Noise Cancellation ANC baterai tahan 30 jam suara bass bertenaga dan bantalan telinga busa memori yang empuk nyaman dipakai seharian",
			price: 1250000,
		},
		{
			id: 2, name: "Smartwatch Fitness Tracker OLED",
			category: "Elektronik & Gadget",
			description: "Jam tangan pintar layar AMOLED pelacak detak jantung monitor kadar oksigen darah SpO2 tahan air 5ATM lebih dari 100 mode latihan olahraga lari bersepeda renang",
			price: 899000,
		},
		{
			id: 3, name: "Laptop Gaming Ultra Slim RTX 4060",
			category: "Elektronik & Gadget",
			description: "Laptop gaming tipis bertenaga dengan GPU NVIDIA RTX 4060 layar 165Hz QHD RAM 16GB DDR5 SSD 1TB NVMe cocok untuk gaming AAA dan kreator konten video editing",
			price: 14999000,
		},
		{
			id: 4, name: "Jaket Bomber Waterproof Tactical",
			category: "Fashion Pria & Wanita",
			description: "Jaket bomber pria bergaya kasual dan tactical bahan taslan anti air waterproof dengan lapisan furing jaring adem cocok untuk berkendara motor outfit harian hangout",
			price: 285000,
		},
		{
			id: 5, name: "Sepatu Running Lightweight Foam",
			category: "Olahraga & Outdoor",
			description: "Sepatu lari ringan dengan sol busa EVA yang nyaman bantalan tebal untuk meredam benturan upper mesh breathable cocok untuk lari maraton jogging dan olahraga sehari-hari",
			price: 650000,
		},
		{
			id: 6, name: "Blender Portable USB Rechargeable",
			category: "Peralatan Rumah Tangga",
			description: "Blender portabel mini yang bisa diisi ulang via USB 6 bilah pisau stainless steel kapasitas 400ml cocok untuk smoothie jus buah protein shake gym dan perjalanan",
			price: 180000,
		},
		{
			id: 7, name: "Tas Ransel Anti-Theft Waterproof",
			category: "Fashion Pria & Wanita",
			description: "Tas ransel anti maling dengan kunci tersembunyi bahan anti air USB charging port bagian dalam berlapis compartment laptop 15.6 inch cocok untuk kuliah kerja dan traveling",
			price: 320000,
		},
		{
			id: 8, name: "Raket Badminton Carbon Fiber Pro",
			category: "Olahraga & Outdoor",
			description: "Raket badminton profesional berbahan serat karbon ringan namun kuat keseimbangan sempurna antara kecepatan dan kekuatan pukulan cocok untuk pemain intermediate dan profesional",
			price: 475000,
		},
		{
			id: 9, name: "TWS Earbuds Active Noise Cancellation",
			category: "Elektronik & Gadget",
			description: "Earbuds true wireless stereo dengan ANC aktif baterai 8 jam case pengisian 24 jam Bluetooth 5.3 koneksi stabil suara jernih bass dan treble seimbang IPX5 tahan keringat",
			price: 599000,
		},
		{
			id: 10, name: "Kursi Gaming Ergonomis Lumbar Support",
			category: "Peralatan Rumah Tangga",
			description: "Kursi gaming ergonomis dengan sandaran punggung lumbar support bantal leher dan punggung sandaran tangan adjustable tinggi kursi bisa diatur material kulit PU premium",
			price: 2200000,
		},
	}

	for _, s := range samples {
		text := buildSeedText(s)
		vector := emb.Embed(text)
		vs.Upsert(&models.ProductVector{
			ProductID:   s.id,
			Name:        s.name,
			Category:    s.category,
			Description: s.description,
			Price:       s.price,
			Vector:      vector,
			TextContent: text,
		})
	}
	log.Printf("[Seed] %d sample product vectors indexed.", len(samples))
}

func buildSeedText(s seedItem) string {
	parts := []string{s.name, s.name, s.category, s.category, s.description}
	return strings.Join(parts, " ")
}
