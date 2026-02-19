package handlers

import (
	"net/http"
	"starter/backend/database"
	"starter/backend/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// POST /api/contact  — public endpoint (from blog frontend)
func CreateContactMessage(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg := models.ContactMessage{
		Name:    input.Name,
		Email:   input.Email,
		Message: input.Message,
	}
	if err := database.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully", "data": msg})
}

// GET /api/messages  — protected
func GetContactMessages(c *gin.Context) {
	var messages []models.ContactMessage
	query := database.DB.Order("created_at DESC")
	if onlyUnread := c.Query("unread"); onlyUnread == "true" {
		query = query.Where("is_read = false")
	}
	if err := query.Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	// Unread count
	var unreadCount int64
	database.DB.Model(&models.ContactMessage{}).Where("is_read = false").Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{"data": messages, "unread_count": unreadCount})
}

// GET /api/messages/:id  — protected
func GetContactMessage(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var msg models.ContactMessage
	if err := database.DB.First(&msg, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}
	// Auto-mark as read when viewed
	database.DB.Model(&msg).Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"data": msg})
}

// PUT /api/messages/:id/read  — protected (mark as read/unread)
func MarkContactMessage(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var input struct {
		IsRead bool `json:"is_read"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Model(&models.ContactMessage{}).Where("id = ?", id).Update("is_read", input.IsRead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Updated"})
}

// DELETE /api/messages/:id  — protected
func DeleteContactMessage(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.ContactMessage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
