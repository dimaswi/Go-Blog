package main

import (
	"log"
	"starter/backend/config"
	"starter/backend/database"
	"starter/backend/handlers"
	"starter/backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default configuration")
	}

	// Load config
	cfg := config.Load()

	// Set JWT secret
	middleware.SetJWTSecret(cfg.JWTSecret)

	// Connect to database
	if err := database.Connect(cfg.DatabaseDSN); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Setup Gin router
	r := gin.Default()

	// Serve static files for uploads
	r.Static("/uploads", "./uploads")

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	api := r.Group("/api")
	{
		api.POST("/auth/login", handlers.Login)
		api.GET("/settings", handlers.GetSettings) // Public access to settings

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/profile", handlers.GetProfile)

			// Settings routes
			protected.PUT("/settings", handlers.UpdateSettings)
			protected.POST("/settings/upload", handlers.UploadLogo)

			// Users routes (with RBAC)
			protected.GET("/users", middleware.RequirePermission("users.view"), handlers.GetUsers)
			protected.GET("/users/:id", middleware.RequirePermission("users.view"), handlers.GetUser)
			protected.POST("/users", middleware.RequirePermission("users.create"), handlers.CreateUser)
			protected.PUT("/users/:id", middleware.RequirePermission("users.update"), handlers.UpdateUser)
			protected.DELETE("/users/:id", middleware.RequirePermission("users.delete"), handlers.DeleteUser)

			// Roles routes (with RBAC)
			protected.GET("/roles", middleware.RequirePermission("roles.view"), handlers.GetRoles)
			protected.GET("/roles/:id", middleware.RequirePermission("roles.view"), handlers.GetRole)
			protected.POST("/roles", middleware.RequirePermission("roles.create"), handlers.CreateRole)
			protected.PUT("/roles/:id", middleware.RequirePermission("roles.update"), handlers.UpdateRole)
			protected.DELETE("/roles/:id", middleware.RequirePermission("roles.delete"), handlers.DeleteRole)

			// Permissions routes
			protected.GET("/permissions", middleware.RequirePermission("permissions.view"), handlers.GetPermissions)
			protected.GET("/permissions/by-module", middleware.RequirePermission("permissions.view"), handlers.GetPermissionsByModule)
			protected.GET("/permissions/:id", middleware.RequirePermission("permissions.view"), handlers.GetPermission)
			protected.POST("/permissions", middleware.RequirePermission("permissions.create"), handlers.CreatePermission)
			protected.PUT("/permissions/:id", middleware.RequirePermission("permissions.update"), handlers.UpdatePermission)
			protected.DELETE("/permissions/:id", middleware.RequirePermission("permissions.delete"), handlers.DeletePermission)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Printf("Server starting on port %s...", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
