package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"starter/backend/database"
	"starter/backend/models"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ============ PORTFOLIO CATEGORIES ============

func GetPortfolioCategories(c *gin.Context) {
	var categories []models.PortfolioCategory
	if err := database.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func CreatePortfolioCategory(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Slug        string `json:"slug" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.PortfolioCategory{
		Name:        input.Name,
		Slug:        input.Slug,
		Description: input.Description,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": category})
}

func UpdatePortfolioCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.PortfolioCategory
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	var input struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		category.Name = input.Name
	}
	if input.Slug != "" {
		category.Slug = input.Slug
	}
	category.Description = input.Description

	if err := database.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": category})
}

func DeletePortfolioCategory(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.PortfolioCategory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// ============ PORTFOLIOS ============

func GetPortfolios(c *gin.Context) {
	var portfolios []models.Portfolio
	query := database.DB.Preload("Category").Order("sort_order ASC, created_at DESC")

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&portfolios).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolios"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": portfolios})
}

func GetPortfolio(c *gin.Context) {
	id := c.Param("id")
	var portfolio models.Portfolio
	if err := database.DB.Preload("Category").First(&portfolio, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": portfolio})
}

// GetPortfolioBySlug - public endpoint for NextJS
func GetPortfolioBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var portfolio models.Portfolio
	if err := database.DB.Preload("Category").
		Where("slug = ? AND status = ?", slug, "published").First(&portfolio).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": portfolio})
}

// GetPublishedPortfolios - public endpoint for NextJS
func GetPublishedPortfolios(c *gin.Context) {
	var portfolios []models.Portfolio
	query := database.DB.Preload("Category").
		Where("status = ?", "published").Order("sort_order ASC, created_at DESC")

	categorySlug := c.Query("category")
	if categorySlug != "" {
		var category models.PortfolioCategory
		if err := database.DB.Where("slug = ?", categorySlug).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}

	if err := query.Find(&portfolios).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolios"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": portfolios})
}

type CreatePortfolioRequest struct {
	Title         string `json:"title" binding:"required"`
	Slug          string `json:"slug" binding:"required"`
	Description   string `json:"description"`
	Content       string `json:"content"`
	FeaturedImage string `json:"featured_image"`
	Images        string `json:"images"`
	ProjectURL    string `json:"project_url"`
	GithubURL     string `json:"github_url"`
	TechStack     string `json:"tech_stack"`
	CategoryID    *uint  `json:"category_id"`
	Status        string `json:"status"`
	SortOrder     int    `json:"sort_order"`
	MetaTitle     string `json:"meta_title"`
	MetaDesc      string `json:"meta_description"`
	MetaKeywords  string `json:"meta_keywords"`
	OgImage       string `json:"og_image"`
}

func CreatePortfolio(c *gin.Context) {
	var req CreatePortfolioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	portfolio := models.Portfolio{
		Title:         req.Title,
		Slug:          req.Slug,
		Description:   req.Description,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		Images:        req.Images,
		ProjectURL:    req.ProjectURL,
		GithubURL:     req.GithubURL,
		TechStack:     req.TechStack,
		CategoryID:    req.CategoryID,
		Status:        req.Status,
		SortOrder:     req.SortOrder,
		MetaTitle:     req.MetaTitle,
		MetaDesc:      req.MetaDesc,
		MetaKeywords:  req.MetaKeywords,
		OgImage:       req.OgImage,
	}

	if req.Status == "" {
		portfolio.Status = "draft"
	}
	if req.Status == "published" {
		now := time.Now()
		portfolio.PublishedAt = &now
	}

	if err := database.DB.Create(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create portfolio"})
		return
	}

	database.DB.Preload("Category").First(&portfolio, portfolio.ID)
	c.JSON(http.StatusCreated, gin.H{"data": portfolio})
}

func UpdatePortfolio(c *gin.Context) {
	id := c.Param("id")
	var portfolio models.Portfolio
	if err := database.DB.First(&portfolio, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	var req CreatePortfolioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wasNotPublished := portfolio.Status != "published"

	portfolio.Title = req.Title
	portfolio.Slug = req.Slug
	portfolio.Description = req.Description
	portfolio.Content = req.Content
	portfolio.FeaturedImage = req.FeaturedImage
	portfolio.Images = req.Images
	portfolio.ProjectURL = req.ProjectURL
	portfolio.GithubURL = req.GithubURL
	portfolio.TechStack = req.TechStack
	portfolio.CategoryID = req.CategoryID
	portfolio.Status = req.Status
	portfolio.SortOrder = req.SortOrder
	portfolio.MetaTitle = req.MetaTitle
	portfolio.MetaDesc = req.MetaDesc
	portfolio.MetaKeywords = req.MetaKeywords
	portfolio.OgImage = req.OgImage

	if req.Status == "published" && wasNotPublished {
		now := time.Now()
		portfolio.PublishedAt = &now
	}

	if err := database.DB.Save(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio"})
		return
	}

	database.DB.Preload("Category").First(&portfolio, portfolio.ID)
	c.JSON(http.StatusOK, gin.H{"data": portfolio})
}

func DeletePortfolio(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Portfolio{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete portfolio"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Portfolio deleted successfully"})
}

// UploadPortfolioImage handles image uploads for portfolio
func UploadPortfolioImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{".png": true, ".jpg": true, ".jpeg": true, ".gif": true, ".webp": true, ".svg": true}
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
		return
	}

	uploadDir := "./uploads/portfolio"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filename := fmt.Sprintf("portfolio_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	url := fmt.Sprintf("/uploads/portfolio/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}
