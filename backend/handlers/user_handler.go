package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"ticket-management-system/models"
	"ticket-management-system/services"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService *services.UserService

	db *sql.DB
}

func NewUserController(
	userService *services.UserService,
	db *sql.DB,
) *UserController {

	return &UserController{
		userService: userService,
		db:          db,
	}
}

// GetUsers godoc
// @Summary Get users
// @Description Get all users with pagination
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param search query string false "Search"
// @Success 200 {object} models.UserListResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/users [get]
func (h *UserController) GetUsers(
	c *gin.Context,
) {

	page, _ := strconv.Atoi(
		c.DefaultQuery("page", "1"),
	)

	pageSize, _ := strconv.Atoi(
		c.DefaultQuery("pageSize", "10"),
	)

	search := c.Query("search")

	companyNameValue,
		exists := c.Get("companyName")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "Company not found in token",
				},
			},
		)

		return
	}

	companyName :=
		companyNameValue.(string)

	response, err :=
		h.userService.GetUsers(
			h.db,
			page,
			pageSize,
			search,
			companyName,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "GET_USERS_FAILED",
					Message: err.Error(),
				},
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"data":    response,
		},
	)
}

// GetUserByID handles fetching a user by ID
// @Summary Get user by ID
// @Description Get a single user by their ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} models.SuccessResponse{data=models.UserMaster}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/users/{id} [get]
func (h *UserController) GetUserByID(
	c *gin.Context,
) {

	userID,
		err :=
		strconv.Atoi(
			c.Param("id"),
		)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid user ID",
				},
			},
		)

		return
	}

	user,
		err :=
		h.userService.GetUserByID(
			h.db,
			userID,
		)

	if err != nil {

		c.JSON(
			http.StatusNotFound,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "USER_NOT_FOUND",
					Message: err.Error(),
				},
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		models.SuccessResponse{
			Success: true,
			Data:    user,
		},
	)
}

// UpdateUser handles updating a user
// @Summary Update user
// @Description Update an existing user by ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param request body models.UserUpdate true "User update payload"
// @Success 200 {object} models.SuccessResponse{data=models.UserMaster}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/users/{id} [put]
func (h *UserController) UpdateUser(
	c *gin.Context,
) {

	userID,
		err :=
		strconv.Atoi(
			c.Param("id"),
		)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid user ID",
				},
			},
		)

		return
	}

	var req models.UserUpdate

	if err :=
		c.ShouldBindJSON(
			&req,
		); err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_REQUEST",
					Message: err.Error(),
				},
			},
		)

		return
	}

	userIDValue,
		exists :=
		c.Get("userID")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "User not authenticated",
				},
			},
		)

		return
	}

	updatedBy,
		ok :=
		userIDValue.(int)

	if !ok {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_USER",
					Message: "Invalid user context",
				},
			},
		)

		return
	}

	user,
		err :=
		h.userService.UpdateUser(
			h.db,
			userID,
			&req,
			updatedBy,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UPDATE_FAILED",
					Message: err.Error(),
				},
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		models.SuccessResponse{
			Success: true,
			Data:    user,
		},
	)
}

// GetCompanyUsers godoc
//
// @Summary Get company users
//
// @Description Returns users belonging to the logged-in user's company
//
// @Tags Users
//
// @Accept json
//
// @Produce json
//
// @Security BearerAuth
//
// @Success 200 {object} models.SuccessResponse
//
// @Failure 401 {object} models.ErrorResponse
//
// @Failure 500 {object} models.ErrorResponse
//
// @Router /users/company-users [get]
func (h *UserController) GetCompanyUsers(
	c *gin.Context,
) {

	userIDValue, exists :=
		c.Get("userID")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			gin.H{
				"success": false,
			},
		)

		return
	}

	userID :=
		userIDValue.(int)

	users, err :=
		h.userService.GetCompanyUsers(
			h.db,
			userID,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"success": false,
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"data":    users,
		},
	)
}
