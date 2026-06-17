package main

import (
	"log"

	"ticket-management-system/config"
	"ticket-management-system/database"
	_ "ticket-management-system/docs"
	"ticket-management-system/handlers"
	"ticket-management-system/middleware"
	"ticket-management-system/services"

	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Ticket Management System API
// @version 1.0
// @description Ticket Management System Backend API using Gin + MSSQL
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@ticketmanagement.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host 164.52.217.188

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {

	// =====================================
	// LOAD CONFIG
	// =====================================

	cfg := config.LoadConfig()

	// =====================================
	// DATABASE
	// =====================================

	if err := database.InitDatabase(
		&cfg.Database,
	); err != nil {

		log.Fatalf(
			"Failed to initialize database: %v",
			err,
		)
	}

	defer database.CloseDatabase()

	// =====================================
	// SERVICES
	// =====================================

	authService :=
		services.NewAuthService(
			&cfg.JWT,
		)

	ticketService :=
		services.NewTicketService()

	userService :=
		services.NewUserService()

	// =====================================
	// HANDLERS
	// =====================================

	authHandler :=
		handlers.NewAuthHandler(
			authService,
			cfg,
		)

	ticketHandler :=
		handlers.NewTicketHandler(
			ticketService,
		)

	userController :=
		handlers.NewUserController(
			userService,
			database.DB,
		)

	// =====================================
	// GIN ROUTER
	// =====================================

	r := gin.Default()

	// =====================================
	// GLOBAL MIDDLEWARE (Apply before routes)
	// =====================================

	r.Use(
		middleware.CORS(cfg.CORS),
	)

	r.Use(
		middleware.RequestID(),
	)

	r.Use(
		middleware.Logger(),
	)

	r.Use(
		middleware.ErrorHandler(),
	)

	// =====================================
	// STATIC FILES
	// =====================================

	r.Static(
		"/uploads",
		"/var/www/ticket-api/uploads",
	)
	// =====================================
	// SWAGGER
	// =====================================

	r.GET(
		"/swagger/*any",
		ginSwagger.WrapHandler(
			swaggerFiles.Handler,
		),
	)

	// =====================================
	// HEALTH CHECK
	// =====================================

	r.GET(
		"/health",
		func(c *gin.Context) {

			c.JSON(
				200,
				gin.H{
					"status": "healthy",
					"timestamp": gin.H{
						"now": "2024-01-01T00:00:00Z",
					},
				},
			)
		},
	)

	// =====================================
	// PUBLIC ROUTES
	// =====================================

	authRoutes :=
		r.Group("/api/auth")

	{
		authRoutes.POST(
			"/login",
			authHandler.Login,
		)

		authRoutes.POST(
			"/register",
			authHandler.Register,
		)

		authRoutes.POST(
			"/refresh",
			authHandler.RefreshToken,
		)

		// =====================================
		// FORGOT PASSWORD
		// =====================================

		authRoutes.POST(
			"/forgot-password",
			authHandler.ForgotPassword,
		)

		// =====================================
		// RESET PASSWORD
		// =====================================

		authRoutes.POST(
			"/reset-password",
			authHandler.ResetPassword,
		)
	}

	// =====================================
	// PROTECTED ROUTES
	// =====================================

	protected :=
		r.Group("/api")

	protected.Use(
		middleware.AuthMiddleware(
			cfg.JWT.SecretKey,
		),
	)

	{
		// =================================
		// AUTH PROFILE
		// =================================

		protected.GET(
			"/auth/profile",
			authHandler.GetProfile,
		)

		protected.PUT(
			"/auth/profile",
			authHandler.UpdateProfile,
		)

		// =================================
		// USER ROUTES
		// =================================

		userRoutes :=
			protected.Group("/users")

		{
			userRoutes.GET(
				"",
				userController.GetUsers,
			)

			userRoutes.GET(
				"/company-users",
				userController.GetCompanyUsers,
			)

			userRoutes.GET(
				"/:id",
				userController.GetUserByID,
			)

			userRoutes.PUT(
				"/:id",
				userController.UpdateUser,
			)
		}

		// =================================
		// COMMENT ROUTES
		// =================================

		commentRoutes :=
			protected.Group(
				"/tickets/:ticketID/comments",
			)

		{
			commentRoutes.GET(
				"",
				ticketHandler.GetComments,
			)

			commentRoutes.POST(
				"",
				ticketHandler.AddComment,
			)

			commentRoutes.PUT(
				"/:commentID",
				ticketHandler.UpdateComment,
			)

			commentRoutes.DELETE(
				"/:commentID",
				ticketHandler.DeleteComment,
			)
		}

		// =================================
		// ATTACHMENT ROUTES
		// =================================

		attachmentRoutes :=
			protected.Group(
				"/tickets/:ticketID/attachments",
			)

		{
			attachmentRoutes.POST(
				"",
				ticketHandler.AddAttachment,
			)
		}

		// =================================
		// TICKET ROUTES
		// =================================

		ticketRoutes :=
			protected.Group("/tickets")

		{
			ticketRoutes.GET(
				"",
				ticketHandler.GetTickets,
			)

			ticketRoutes.GET(
				"/export",
				ticketHandler.ExportTickets,
			)

			ticketRoutes.GET(
				"/:ticketID",
				ticketHandler.GetTicketByID,
			)

			ticketRoutes.POST(
				"",
				ticketHandler.CreateTicket,
			)

			ticketRoutes.PUT(
				"/:ticketID",
				ticketHandler.UpdateTicket,
			)

			ticketRoutes.DELETE(
				"/:ticketID",
				ticketHandler.DeleteTicket,
			)
			ticketRoutes.GET(
				"/sla-metrics",
				ticketHandler.GetSLAMetrics,
			)
		}
	}

	companyService :=
		services.NewCompanyService()

	companyHandler :=
		handlers.NewCompanyHandler(
			companyService,
		)

	protected.GET(
		"/companies",
		companyHandler.GetCompanies,
	)

	// =====================================
	// DEBUG ROUTES
	// =====================================

	for _, route := range r.Routes() {

		log.Printf(
			"%s %s",
			route.Method,
			route.Path,
		)
	}

	// =====================================
	// START SERVER
	// =====================================

	port := ":" + cfg.Server.Port

	log.Printf(
		"Server starting on port %s",
		port,
	)

	if err := r.Run(port); err != nil {

		log.Fatalf(
			"Failed to start server: %v",
			err,
		)
	}
}
