package models

import (
	"time"

	"gorm.io/gorm"
)

type Blog struct {
	ID            uint           `json:"id" gorm:"primarykey"`
	Title         string         `json:"title" gorm:"not null"`
	Slug          string         `json:"slug" gorm:"uniqueIndex;not null"`
	Excerpt       string         `json:"excerpt"`
	Content       string         `json:"content" gorm:"type:text"`
	FeaturedImage string         `json:"featured_image"`
	Status        string         `json:"status" gorm:"default:draft"` // draft, published
	AuthorID      uint           `json:"author_id"`
	Author        User           `json:"author" gorm:"foreignKey:AuthorID"`
	CategoryID    *uint          `json:"category_id"`
	Category      *BlogCategory  `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Tags          []BlogTag      `json:"tags" gorm:"many2many:blog_post_tags;"`
	MetaTitle     string         `json:"meta_title"`
	MetaDesc      string         `json:"meta_description"`
	MetaKeywords  string         `json:"meta_keywords"`
	OgImage       string         `json:"og_image"`
	PublishedAt   *time.Time     `json:"published_at"`
	ViewCount     uint           `json:"view_count" gorm:"default:0"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type BlogCategory struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type BlogTag struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	Name      string         `json:"name" gorm:"not null"`
	Slug      string         `json:"slug" gorm:"uniqueIndex;not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
