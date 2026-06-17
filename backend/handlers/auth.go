package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"ticket-management-system/config"
	"ticket-management-system/database"
	"ticket-management-system/models"
	"ticket-management-system/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
	cfg         *config.Config
}

func NewAuthHandler(authService *services.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		cfg:         cfg,
	}
}

// Login handles user login
// @Summary User login
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.UserLogin true "Login credentials"
// @Success 200 {object} models.TokenResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.UserLogin
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err,
			},
		})
		return
	}

	tokenResp, err := h.authService.Login(database.DB, req.Email, req.Password)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_CREDENTIALS",
					Message: "Invalid email or password",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to process login request",
			},
		})
		return
	}

	c.JSON(http.StatusOK, tokenResp)
}

// Register handles user registration
// @Summary Register new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.UserRegister true "Registration data"
// @Success 201 {object} models.UserResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.UserRegister

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println("❌ Bind Error:", err)

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: err.Error(),
			},
		})
		return
	}

	fmt.Println("📥 Incoming Register Request:", req)

	userResp, err := h.authService.Register(database.DB, &req)
	if err != nil {
		fmt.Println("🔥 Register error:", err)

		if err.Error() == "user with this email already exists" {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "USER_EXISTS",
					Message: err.Error(),
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INTERNAL_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	fmt.Println("✅ User created:", userResp)

	c.JSON(http.StatusCreated, userResp)
}

// RefreshToken handles token refresh
// @Summary Refresh JWT token
// @Description Generate a new JWT token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Refresh token request"
// @Success 200 {object} models.TokenResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err,
			},
		})
		return
	}

	tokenResp, err := h.authService.RefreshToken(database.DB, req.RefreshToken)
	if err != nil {
		if err == services.ErrInvalidToken || err == services.ErrTokenExpired {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_TOKEN",
					Message: "Invalid or expired refresh token",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to refresh token",
			},
		})
		return
	}

	c.JSON(http.StatusOK, tokenResp)
}

// GetProfile handles getting user profile
// @Summary Get user profile
// @Description Retrieve current user's profile information
// @Tags auth
// @Produce json
// @Success 200 {object} models.UserResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userIDStr := c.GetString("userID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	_ = userID // userID is used implicitly through the context

	userResp, err := h.authService.GetProfile(database.DB, userID)
	if err != nil {
		if err == services.ErrUserNotFound {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "USER_NOT_FOUND",
					Message: "User not found",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve user profile",
			},
		})
		return
	}

	c.JSON(http.StatusOK, userResp)
}

// UpdateProfile handles updating user profile
// @Summary Update user profile
// @Description Update current user's profile information
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Profile update data"
// @Success 200 {object} models.UserResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/auth/profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userIDStr := c.GetString("userID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	var req struct {
		Name        *string `json:"name"`
		CompanyName *string `json:"companyName"`
		Designation *string `json:"designation"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err,
			},
		})
		return
	}

	_ = userID // userID is used implicitly through the context

	// TODO: Implement profile update logic
	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Profile update not yet implemented",
	})
}

// ForgotPassword handles forgot password request
//
// @Summary Forgot Password
// @Description Send password reset email
// @Tags auth
// @Accept json
// @Produce json
//
// @Param request body models.ForgotPasswordRequest true "Forgot password request"
//
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
//
// @Router /api/auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(
	c *gin.Context,
) {

	var req models.ForgotPasswordRequest

	// =====================================
	// BIND REQUEST
	// =====================================

	if err := c.ShouldBindJSON(
		&req,
	); err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "INVALID_REQUEST",

					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// SERVICE CALL
	// =====================================

	err := h.authService.ForgotPassword(

		database.DB,

		req.Email,
	)

	if err != nil {

		if err.Error() ==
			"user with this email does not exist" {

			c.JSON(
				http.StatusNotFound,
				models.ErrorResponse{

					Success: false,

					Error: models.Error{

						Code: "USER_NOT_FOUND",

						Message: err.Error(),
					},
				},
			)

			return
		}

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "FORGOT_PASSWORD_FAILED",

					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// SUCCESS RESPONSE
	// =====================================

	c.JSON(
		http.StatusOK,
		models.SuccessResponse{

			Success: true,

			Message: "Password reset email sent successfully",
		},
	)
}

// ResetPassword handles password reset
//
// @Summary Reset Password
// @Description Reset user password using reset token
// @Tags auth
// @Accept json
// @Produce json
//
// @Param request body models.ResetPasswordRequest true "Reset password request"
//
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
//
// @Router /api/auth/reset-password [post]
func (h *AuthHandler) ResetPassword(
	c *gin.Context,
) {

	var req models.ResetPasswordRequest

	// =====================================
	// BIND REQUEST
	// =====================================

	if err := c.ShouldBindJSON(
		&req,
	); err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "INVALID_REQUEST",

					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// VALIDATE
	// =====================================

	if req.Token == "" {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "INVALID_TOKEN",

					Message: "Reset token is required",
				},
			},
		)

		return
	}

	if req.NewPassword == "" {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "INVALID_PASSWORD",

					Message: "New password is required",
				},
			},
		)

		return
	}

	// =====================================
	// SERVICE CALL
	// =====================================

	err := h.authService.ResetPassword(

		database.DB,

		req.Token,

		req.NewPassword,
	)

	if err != nil {

		// Check if it's an invalid/expired token error
		if err == services.ErrInvalidResetToken {
			c.JSON(
				http.StatusBadRequest,
				models.ErrorResponse{

					Success: false,

					Error: models.Error{

						Code: "RESET_PASSWORD_FAILED",

						Message: err.Error(),
					},
				},
			)

			return
		}

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "RESET_PASSWORD_FAILED",

					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// SUCCESS RESPONSE
	// =====================================

	c.JSON(
		http.StatusOK,
		models.SuccessResponse{

			Success: true,

			Message: "Password reset successfully",
		},
	)
}
