package config

import (
	"os"
	"strconv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	ConnectionString string
}

type JWTConfig struct {
	SecretKey     string
	ExpiresIn     int64 // in seconds
	RefreshExpiry int64 // in seconds
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8081"),
		},
		Database: DatabaseConfig{
			ConnectionString: getEnv("DATABASE_CONNECTION_STRING", "server=164.52.217.188;user id=sa;password=BusOn@123;port=3303;database=TMS;encrypt=disable"),
		},
		JWT: JWTConfig{
			SecretKey:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			ExpiresIn:     3600,   // 1 hour
			RefreshExpiry: 604800, // 7 days
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{
				"http://localhost:3000",
				"http://localhost:5173",
				"http://localhost:3001",
				"http://localhost:8080",
				"http://164.52.217.188",
				"http://164.52.217.188:8082",
				"http://164.52.217.188:5173",
				"*",
			},
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders: []string{"Authorization", "Content-Type", "X-Trace-ID"},
		},
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvInt(key string, defaultValue int) int {
	value, err := strconv.Atoi(os.Getenv(key))
	if err != nil {
		return defaultValue
	}
	return value
}
