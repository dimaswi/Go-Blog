package handlers

import (
	"net/http"
	"starter/backend/database"
	"starter/backend/models"

	"github.com/gin-gonic/gin"
)

// GetSettings returns all settings as key-value pairs
func GetSettings(c *gin.Context) {
	var settings []models.Setting
	if err := database.DB.Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Convert to map for easier frontend consumption
	settingsMap := make(map[string]string)
	for _, setting := range settings {
		settingsMap[setting.Key] = setting.Value
	}

	c.JSON(http.StatusOK, gin.H{"data": settingsMap})
}

// UpdateSettings updates multiple settings at once
func UpdateSettings(c *gin.Context) {
	var input map[string]string
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update or create each setting
	for key, value := range input {
		var setting models.Setting
		result := database.DB.Where("key = ?", key).First(&setting)

		if result.Error != nil {
			// Create new setting
			setting = models.Setting{
				Key:   key,
				Value: value,
			}
			if err := database.DB.Create(&setting).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create setting"})
				return
			}
		} else {
			// Update existing setting
			setting.Value = value
			if err := database.DB.Save(&setting).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update setting"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}
