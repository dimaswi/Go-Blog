package main

import (
	"log"
	"os"
	"starter/backend/config"
	"starter/backend/database"
	"starter/backend/handlers"
	"starter/backend/middleware"
	"strings"

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

	// CORS middleware (must be before Static so uploads also get CORS headers)
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://147.93.104.139:2221", "http://147.93.104.139:2222"}
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		parts := strings.Split(origins, ",")
		allowedOrigins = make([]string, 0, len(parts))
		for _, o := range parts {
			if trimmed := strings.TrimSpace(o); trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve static files for uploads
	r.Static("/uploads", "./uploads")

	// Public routes
	api := r.Group("/api")
	{
		api.POST("/auth/login", handlers.Login)
		api.GET("/settings", handlers.GetSettings)          // Public access to settings
		api.POST("/contact", handlers.CreateContactMessage) // Public contact form

		// Public blog/portfolio routes (for NextJS frontend)
		api.GET("/public/blogs", handlers.GetPublishedBlogs)
		api.GET("/public/blogs/:slug", handlers.GetBlogBySlug)
		api.GET("/public/blog-categories", handlers.GetBlogCategories)
		api.GET("/public/blog-tags", handlers.GetBlogTags)
		api.GET("/public/portfolios", handlers.GetPublishedPortfolios)
		api.GET("/public/portfolios/:slug", handlers.GetPortfolioBySlug)
		api.GET("/public/portfolio-categories", handlers.GetPortfolioCategories)

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

			// Blog routes (with RBAC)
			protected.GET("/blogs", middleware.RequirePermission("blogs.view"), handlers.GetBlogs)
			protected.GET("/blogs/:id", middleware.RequirePermission("blogs.view"), handlers.GetBlog)
			protected.POST("/blogs", middleware.RequirePermission("blogs.create"), handlers.CreateBlog)
			protected.PUT("/blogs/:id", middleware.RequirePermission("blogs.update"), handlers.UpdateBlog)
			protected.DELETE("/blogs/:id", middleware.RequirePermission("blogs.delete"), handlers.DeleteBlog)
			protected.POST("/blogs/upload", middleware.RequirePermission("blogs.create"), handlers.UploadBlogImage)

			// Blog Categories
			protected.GET("/blog-categories", middleware.RequirePermission("blogs.view"), handlers.GetBlogCategories)
			protected.GET("/blog-categories/:id", middleware.RequirePermission("blogs.view"), handlers.GetBlogCategory)
			protected.POST("/blog-categories", middleware.RequirePermission("blogs.create"), handlers.CreateBlogCategory)
			protected.PUT("/blog-categories/:id", middleware.RequirePermission("blogs.update"), handlers.UpdateBlogCategory)
			protected.DELETE("/blog-categories/:id", middleware.RequirePermission("blogs.delete"), handlers.DeleteBlogCategory)

			// Blog Tags
			protected.GET("/blog-tags", middleware.RequirePermission("blogs.view"), handlers.GetBlogTags)
			protected.POST("/blog-tags", middleware.RequirePermission("blogs.create"), handlers.CreateBlogTag)
			protected.DELETE("/blog-tags/:id", middleware.RequirePermission("blogs.delete"), handlers.DeleteBlogTag)

			// Portfolio routes (with RBAC)
			protected.GET("/portfolios", middleware.RequirePermission("portfolios.view"), handlers.GetPortfolios)
			protected.GET("/portfolios/:id", middleware.RequirePermission("portfolios.view"), handlers.GetPortfolio)
			protected.POST("/portfolios", middleware.RequirePermission("portfolios.create"), handlers.CreatePortfolio)
			protected.PUT("/portfolios/:id", middleware.RequirePermission("portfolios.update"), handlers.UpdatePortfolio)
			protected.DELETE("/portfolios/:id", middleware.RequirePermission("portfolios.delete"), handlers.DeletePortfolio)
			protected.POST("/portfolios/upload", middleware.RequirePermission("portfolios.create"), handlers.UploadPortfolioImage)

			// Portfolio Categories
			protected.GET("/portfolio-categories", middleware.RequirePermission("portfolios.view"), handlers.GetPortfolioCategories)
			protected.POST("/portfolio-categories", middleware.RequirePermission("portfolios.create"), handlers.CreatePortfolioCategory)
			protected.PUT("/portfolio-categories/:id", middleware.RequirePermission("portfolios.update"), handlers.UpdatePortfolioCategory)
			protected.DELETE("/portfolio-categories/:id", middleware.RequirePermission("portfolios.delete"), handlers.DeletePortfolioCategory)

			// Contact Messages
			protected.GET("/messages", handlers.GetContactMessages)
			protected.GET("/messages/:id", handlers.GetContactMessage)
			protected.PUT("/messages/:id/read", handlers.MarkContactMessage)
			protected.DELETE("/messages/:id", handlers.DeleteContactMessage)
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
