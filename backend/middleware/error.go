package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// ErrorHandler creates middleware to handle errors globally
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors in the context
		if len(c.Errors) > 0 {
			errors := c.Errors.Errors()
			if len(errors) > 0 {
				err := errors[0]
				logrus.WithFields(logrus.Fields{
					"status_code": c.Writer.Status(),
					"method":      c.Request.Method,
					"path":        c.Request.URL.Path,
					"request_id":  c.GetString("requestID"),
					"error":       err,
				}).Error("Error occurred")

				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "INTERNAL_ERROR",
						"message": "An internal error occurred",
					},
				})
			}
		}
	}
}
