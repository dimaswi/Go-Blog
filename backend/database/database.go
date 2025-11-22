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
	err := DB.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.Setting{},
	)
	if err != nil {
		return err
	}

	log.Println("Database migrated successfully")
	return SeedData()
}

func SeedData() error {
	// Create default permissions
	permissions := []models.Permission{
		{Name: "users.read", Resource: "users", Action: "read", Description: "View users"},
		{Name: "users.create", Resource: "users", Action: "create", Description: "Create users"},
		{Name: "users.update", Resource: "users", Action: "update", Description: "Update users"},
		{Name: "users.delete", Resource: "users", Action: "delete", Description: "Delete users"},
		{Name: "roles.read", Resource: "roles", Action: "read", Description: "View roles"},
		{Name: "roles.create", Resource: "roles", Action: "create", Description: "Create roles"},
		{Name: "roles.update", Resource: "roles", Action: "update", Description: "Update roles"},
		{Name: "roles.delete", Resource: "roles", Action: "delete", Description: "Delete roles"},
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
	DB.Model(&adminRole).Association("Permissions").Replace(allPermissions)

	// Assign read permissions to user role
	var readPermissions []models.Permission
	DB.Where("action = ?", "read").Find(&readPermissions)
	DB.Model(&userRole).Association("Permissions").Replace(readPermissions)

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
