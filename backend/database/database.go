package database

import (
	"log"
	"starter/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(dsn string) error {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

func Migrate() error {
	// Auto-migrate all models with proper order for foreign key dependencies
	err := DB.AutoMigrate(
		&models.Role{},              // First, roles
		&models.Permission{},        // Then permissions
		&models.RolePermission{},    // Junction table
		&models.User{},              // Then users (depends on roles)
		&models.Setting{},           // Settings
		&models.BlogCategory{},      // Blog categories
		&models.BlogTag{},           // Blog tags
		&models.Blog{},              // Blog posts
		&models.PortfolioCategory{}, // Portfolio categories
		&models.Portfolio{},         // Portfolio items
		&models.ContactMessage{},    // Contact form messages
	)

	if err != nil {
		return err
	}

	log.Println("Database migrated successfully")
	return SeedData()
}

// CleanMigrate drops all tables and recreates them for fresh database structure
func CleanMigrate() error {
	// Drop tables in reverse order to handle foreign key constraints
	DB.Exec("DROP TABLE IF EXISTS blog_post_tags CASCADE")
	DB.Exec("DROP TABLE IF EXISTS blogs CASCADE")
	DB.Exec("DROP TABLE IF EXISTS blog_categories CASCADE")
	DB.Exec("DROP TABLE IF EXISTS blog_tags CASCADE")
	DB.Exec("DROP TABLE IF EXISTS portfolios CASCADE")
	DB.Exec("DROP TABLE IF EXISTS portfolio_categories CASCADE")
	DB.Exec("DROP TABLE IF EXISTS role_permissions CASCADE")
	DB.Exec("DROP TABLE IF EXISTS users CASCADE")
	DB.Exec("DROP TABLE IF EXISTS permissions CASCADE")
	DB.Exec("DROP TABLE IF EXISTS roles CASCADE")
	DB.Exec("DROP TABLE IF EXISTS settings CASCADE")

	log.Println("Dropped existing tables for clean migration")

	// Now run normal migration
	return Migrate()
}

func SeedData() error {
	// Seed granular permissions that match frontend permission checks
	permissions := []models.Permission{
		// Users Management
		{Name: "users.view", Module: "User Management", Category: "Users", Description: "View users list and details", Actions: `["read"]`},
		{Name: "users.create", Module: "User Management", Category: "Users", Description: "Create new users", Actions: `["create"]`},
		{Name: "users.update", Module: "User Management", Category: "Users", Description: "Update existing users", Actions: `["update"]`},
		{Name: "users.delete", Module: "User Management", Category: "Users", Description: "Delete users", Actions: `["delete"]`},

		// Roles Management
		{Name: "roles.view", Module: "Role Management", Category: "Roles", Description: "View roles list and details", Actions: `["read"]`},
		{Name: "roles.create", Module: "Role Management", Category: "Roles", Description: "Create new roles", Actions: `["create"]`},
		{Name: "roles.update", Module: "Role Management", Category: "Roles", Description: "Update existing roles", Actions: `["update"]`},
		{Name: "roles.delete", Module: "Role Management", Category: "Roles", Description: "Delete roles", Actions: `["delete"]`},
		{Name: "roles.assign_permissions", Module: "Role Management", Category: "Roles", Description: "Assign permissions to roles", Actions: `["assign"]`},

		// Permissions Management
		{Name: "permissions.view", Module: "Permission Management", Category: "Permissions", Description: "View permissions list and details", Actions: `["read"]`},
		{Name: "permissions.create", Module: "Permission Management", Category: "Permissions", Description: "Create new permissions", Actions: `["create"]`},
		{Name: "permissions.update", Module: "Permission Management", Category: "Permissions", Description: "Update existing permissions", Actions: `["update"]`},
		{Name: "permissions.delete", Module: "Permission Management", Category: "Permissions", Description: "Delete permissions", Actions: `["delete"]`},

		// Blog Management
		{Name: "blogs.view", Module: "Blog Management", Category: "Blogs", Description: "View blog posts", Actions: `["read"]`},
		{Name: "blogs.create", Module: "Blog Management", Category: "Blogs", Description: "Create blog posts", Actions: `["create"]`},
		{Name: "blogs.update", Module: "Blog Management", Category: "Blogs", Description: "Update blog posts", Actions: `["update"]`},
		{Name: "blogs.delete", Module: "Blog Management", Category: "Blogs", Description: "Delete blog posts", Actions: `["delete"]`},

		// Portfolio Management
		{Name: "portfolios.view", Module: "Portfolio Management", Category: "Portfolios", Description: "View portfolios", Actions: `["read"]`},
		{Name: "portfolios.create", Module: "Portfolio Management", Category: "Portfolios", Description: "Create portfolios", Actions: `["create"]`},
		{Name: "portfolios.update", Module: "Portfolio Management", Category: "Portfolios", Description: "Update portfolios", Actions: `["update"]`},
		{Name: "portfolios.delete", Module: "Portfolio Management", Category: "Portfolios", Description: "Delete portfolios", Actions: `["delete"]`},

		// System & Dashboard
		{Name: "dashboard.view", Module: "Dashboard", Category: "Analytics", Description: "Access dashboard and reports", Actions: `["read"]`},
		{Name: "settings.view", Module: "System Settings", Category: "Settings", Description: "View system settings", Actions: `["read"]`},
		{Name: "settings.update", Module: "System Settings", Category: "Settings", Description: "Update system settings", Actions: `["update"]`},
		{Name: "profile.view", Module: "Profile Management", Category: "Account", Description: "View own profile", Actions: `["read"]`},
		{Name: "profile.update", Module: "Profile Management", Category: "Account", Description: "Update own profile", Actions: `["update"]`},
	}

	for _, perm := range permissions {
		DB.Where(models.Permission{Name: perm.Name}).FirstOrCreate(&perm)
	}

	// Create default roles
	var adminRole models.Role
	DB.Where(models.Role{Name: "admin"}).FirstOrCreate(&adminRole, models.Role{
		Name:        "admin",
		Description: "Administrator with full access",
	})

	var userRole models.Role
	DB.Where(models.Role{Name: "user"}).FirstOrCreate(&userRole, models.Role{
		Name:        "user",
		Description: "Regular user with limited access",
	})

	// Assign all permissions to admin role
	var allPermissions []models.Permission
	DB.Find(&allPermissions)
	if len(allPermissions) > 0 {
		DB.Model(&adminRole).Association("Permissions").Replace(allPermissions)
	}

	// Assign limited permissions to user role
	var limitedPermissions []models.Permission
	DB.Where("name IN ?", []string{"profile.view", "profile.update", "dashboard.view"}).Find(&limitedPermissions)
	if len(limitedPermissions) > 0 {
		DB.Model(&userRole).Association("Permissions").Replace(limitedPermissions)
	}

	// Create default admin user
	var adminUser models.User
	result := DB.Where(models.User{Email: "admin@simrs.com"}).FirstOrCreate(&adminUser, models.User{
		Email:    "admin@simrs.com",
		Username: "admin",
		FullName: "System Administrator",
		IsActive: true,
		RoleID:   adminRole.ID,
	})

	if result.RowsAffected > 0 {
		adminUser.HashPassword("admin123")
		DB.Save(&adminUser)
		log.Println("Default admin user created: admin@simrs.com / admin123")
	}

	// Create default settings
	defaultSettings := []models.Setting{
		{Key: "app_name", Value: "StarterKits"},
		{Key: "app_subtitle", Value: "Hospital System"},
	}

	for _, setting := range defaultSettings {
		DB.Where(models.Setting{Key: setting.Key}).FirstOrCreate(&setting)
	}

	return nil
}
