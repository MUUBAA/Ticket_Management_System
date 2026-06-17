package middleware

import (
	"ticket-management-system/config"

	"github.com/gin-gonic/gin"
)

// CORS creates middleware to handle Cross-Origin Resource Sharing
func CORS(config config.CORSConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the origin from the request
		origin := c.Request.Header.Get("Origin")

		// Default to wildcard for maximum compatibility with static files
		allowedOrigin := "*"

		// Check if specific origins are configured and not just wildcard
		if len(config.AllowedOrigins) > 0 && config.AllowedOrigins[0] != "*" {
			// Check if the origin is in the allowed list
			for _, allowed := range config.AllowedOrigins {
				if allowed == origin {
					allowedOrigin = origin
					break
				}
			}
			// If no exact match but wildcard exists in config, use wildcard
			for _, allowed := range config.AllowedOrigins {
				if allowed == "*" {
					allowedOrigin = "*"
					break
				}
			}
		}

		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Trace-ID")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Max-Age", "86400")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
