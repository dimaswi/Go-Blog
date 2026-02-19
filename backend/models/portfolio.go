package models

import (
	"time"

	"gorm.io/gorm"
)

type Portfolio struct {
	ID            uint               `json:"id" gorm:"primarykey"`
	Title         string             `json:"title" gorm:"not null"`
	Slug          string             `json:"slug" gorm:"uniqueIndex;not null"`
	Description   string             `json:"description" gorm:"type:text"`
	Content       string             `json:"content" gorm:"type:text"`
	FeaturedImage string             `json:"featured_image"`
	Images        string             `json:"images" gorm:"type:text"` // JSON array of image URLs
	ProjectURL    string             `json:"project_url"`
	GithubURL     string             `json:"github_url"`
	TechStack     string             `json:"tech_stack" gorm:"type:text"` // JSON array
	CategoryID    *uint              `json:"category_id"`
	Category      *PortfolioCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Status        string             `json:"status" gorm:"default:draft"` // draft, published
	SortOrder     int                `json:"sort_order" gorm:"default:0"`
	MetaTitle     string             `json:"meta_title"`
	MetaDesc      string             `json:"meta_description"`
	MetaKeywords  string             `json:"meta_keywords"`
	OgImage       string             `json:"og_image"`
	PublishedAt   *time.Time         `json:"published_at"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
	DeletedAt     gorm.DeletedAt     `json:"-" gorm:"index"`
}

type PortfolioCategory struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
