package config

import (
	"os"
)

type Config struct {
	DatabaseDSN string
	JWTSecret   string
	ServerPort  string
}

func Load() *Config {
	return &Config{
		DatabaseDSN: getEnv("DATABASE_DSN", "host=localhost user=simrs password=simrs123 dbname=simrs port=5432 sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
