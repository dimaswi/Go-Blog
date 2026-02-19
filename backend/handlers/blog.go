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
	"gorm.io/gorm"
)

// ============ BLOG CATEGORIES ============

func GetBlogCategories(c *gin.Context) {
	var categories []models.BlogCategory
	if err := database.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func GetBlogCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.BlogCategory
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": category})
}

func CreateBlogCategory(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Slug        string `json:"slug" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.BlogCategory{
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

func UpdateBlogCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.BlogCategory
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

func DeleteBlogCategory(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.BlogCategory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// ============ BLOG TAGS ============

func GetBlogTags(c *gin.Context) {
	var tags []models.BlogTag
	if err := database.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tags})
}

func CreateBlogTag(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
		Slug string `json:"slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag := models.BlogTag{Name: input.Name, Slug: input.Slug}
	if err := database.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": tag})
}

func DeleteBlogTag(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.BlogTag{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tag"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tag deleted successfully"})
}

// ============ BLOG POSTS ============

func GetBlogs(c *gin.Context) {
	var blogs []models.Blog
	query := database.DB.Preload("Author").Preload("Category").Preload("Tags").Order("created_at DESC")

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by category
	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Search
	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR excerpt ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": blogs})
}

func GetBlog(c *gin.Context) {
	id := c.Param("id")
	var blog models.Blog
	if err := database.DB.Preload("Author").Preload("Category").Preload("Tags").First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": blog})
}

// GetBlogBySlug - public endpoint for NextJS
func GetBlogBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var blog models.Blog
	if err := database.DB.Preload("Author").Preload("Category").Preload("Tags").
		Where("slug = ? AND status = ?", slug, "published").First(&blog).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	// Increment view count
	database.DB.Model(&blog).UpdateColumn("view_count", gorm.Expr("view_count + 1"))

	c.JSON(http.StatusOK, gin.H{"data": blog})
}

// GetPublishedBlogs - public endpoint for NextJS
func GetPublishedBlogs(c *gin.Context) {
	var blogs []models.Blog
	query := database.DB.Preload("Author").Preload("Category").Preload("Tags").
		Where("status = ?", "published").Order("published_at DESC")

	// Pagination
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	// Filter by category slug
	categorySlug := c.Query("category")
	if categorySlug != "" {
		var category models.BlogCategory
		if err := database.DB.Where("slug = ?", categorySlug).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}

	// Filter by tag slug
	tagSlug := c.Query("tag")
	if tagSlug != "" {
		var tag models.BlogTag
		if err := database.DB.Where("slug = ?", tagSlug).First(&tag).Error; err == nil {
			query = query.Joins("JOIN blog_post_tags ON blog_post_tags.blog_id = blogs.id").
				Where("blog_post_tags.blog_tag_id = ?", tag.ID)
		}
	}

	// Search
	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR excerpt ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Model(&models.Blog{}).Count(&total)

	// Apply pagination
	var pageInt, limitInt int
	fmt.Sscanf(page, "%d", &pageInt)
	fmt.Sscanf(limit, "%d", &limitInt)
	if pageInt < 1 {
		pageInt = 1
	}
	if limitInt < 1 || limitInt > 50 {
		limitInt = 10
	}
	offset := (pageInt - 1) * limitInt

	if err := query.Offset(offset).Limit(limitInt).Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  blogs,
		"total": total,
		"page":  pageInt,
		"limit": limitInt,
	})
}

type CreateBlogRequest struct {
	Title         string `json:"title" binding:"required"`
	Slug          string `json:"slug" binding:"required"`
	Excerpt       string `json:"excerpt"`
	Content       string `json:"content"`
	FeaturedImage string `json:"featured_image"`
	Status        string `json:"status"`
	CategoryID    *uint  `json:"category_id"`
	TagIDs        []uint `json:"tag_ids"`
	MetaTitle     string `json:"meta_title"`
	MetaDesc      string `json:"meta_description"`
	MetaKeywords  string `json:"meta_keywords"`
	OgImage       string `json:"og_image"`
}

func CreateBlog(c *gin.Context) {
	var req CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	blog := models.Blog{
		Title:         req.Title,
		Slug:          req.Slug,
		Excerpt:       req.Excerpt,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		Status:        req.Status,
		AuthorID:      userID.(uint),
		CategoryID:    req.CategoryID,
		MetaTitle:     req.MetaTitle,
		MetaDesc:      req.MetaDesc,
		MetaKeywords:  req.MetaKeywords,
		OgImage:       req.OgImage,
	}

	if req.Status == "" {
		blog.Status = "draft"
	}

	if req.Status == "published" {
		now := time.Now()
		blog.PublishedAt = &now
	}

	if err := database.DB.Create(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog"})
		return
	}

	// Assign tags
	if len(req.TagIDs) > 0 {
		var tags []models.BlogTag
		database.DB.Find(&tags, req.TagIDs)
		database.DB.Model(&blog).Association("Tags").Replace(tags)
	}

	database.DB.Preload("Author").Preload("Category").Preload("Tags").First(&blog, blog.ID)
	c.JSON(http.StatusCreated, gin.H{"data": blog})
}

func UpdateBlog(c *gin.Context) {
	id := c.Param("id")
	var blog models.Blog
	if err := database.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	var req CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wasNotPublished := blog.Status != "published"

	blog.Title = req.Title
	blog.Slug = req.Slug
	blog.Excerpt = req.Excerpt
	blog.Content = req.Content
	blog.FeaturedImage = req.FeaturedImage
	blog.Status = req.Status
	blog.CategoryID = req.CategoryID
	blog.MetaTitle = req.MetaTitle
	blog.MetaDesc = req.MetaDesc
	blog.MetaKeywords = req.MetaKeywords
	blog.OgImage = req.OgImage

	if req.Status == "published" && wasNotPublished {
		now := time.Now()
		blog.PublishedAt = &now
	}

	if err := database.DB.Save(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog"})
		return
	}

	// Update tags
	if req.TagIDs != nil {
		var tags []models.BlogTag
		database.DB.Find(&tags, req.TagIDs)
		database.DB.Model(&blog).Association("Tags").Replace(tags)
	}

	database.DB.Preload("Author").Preload("Category").Preload("Tags").First(&blog, blog.ID)
	c.JSON(http.StatusOK, gin.H{"data": blog})
}

func DeleteBlog(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Blog{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}

// UploadBlogImage handles image uploads for blog content
func UploadBlogImage(c *gin.Context) {
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

	uploadDir := "./uploads/blog"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filename := fmt.Sprintf("blog_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	url := fmt.Sprintf("/uploads/blog/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}
