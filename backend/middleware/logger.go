package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Logger creates middleware to log HTTP requests
func Logger() gin.HandlerFunc {
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})
	logrus.SetOutput(gin.DefaultWriter)

	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		logrus.WithFields(logrus.Fields{
			"status_code": statusCode,
			"latency":     latency.String(),
			"method":      c.Request.Method,
			"path":        path,
			"query":       query,
			"ip":          c.ClientIP(),
			"user_agent":  c.Request.UserAgent(),
			"request_id":  c.GetString("requestID"),
		}).Info("HTTP Request")
	}
}
