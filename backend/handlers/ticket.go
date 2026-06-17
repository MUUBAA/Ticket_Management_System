package handlers

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"ticket-management-system/database"
	"ticket-management-system/models"
	"ticket-management-system/services"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

type TicketHandler struct {
	ticketService *services.TicketService
}

func NewTicketHandler(ticketService *services.TicketService) *TicketHandler {
	return &TicketHandler{
		ticketService: ticketService,
	}
}

// GetTickets godoc
// @Summary Get all tickets
// @Description Retrieve paginated list of tickets
// @Tags tickets
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10)
// @Param status query string false "Filter by status"
// @Param ticketType query string false "Filter by ticket type"
// @Param search query string false "Search keyword"
// @Param sortBy query string false "Sort field"
// @Param sortOrder query string false "ASC or DESC"
// @Success 200 {object} models.TicketListResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets [get]
func (h *TicketHandler) GetTickets(c *gin.Context) {

	page, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"page",
				"1",
			),
		)

	pageSize, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"pageSize",
				"10",
			),
		)

	// =====================================
	// GET USER ID
	// =====================================

	userIDValue, exists :=
		c.Get("userID")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "User not authorized",
				},
			},
		)

		return
	}

	userID :=
		userIDValue.(int)

	// =====================================
	// GET ROLE
	// =====================================

	roleValue, exists :=
		c.Get("role")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "Role not found",
				},
			},
		)

		return
	}

	role :=
		roleValue.(string)

	// =====================================
	// FILTERS
	// =====================================

	status :=
		c.Query("status")

	ticketType :=
		c.Query("ticketType")

	priority :=
		c.Query("priority")

	search :=
		c.Query("search")

	customerName :=
		c.Query("customerName")

	projectName :=
		c.Query("projectName")

	companyName :=
		c.Query("companyName")

	assignedTo, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"assignedTo",
				"0",
			),
		)

	fromDate :=
		c.Query("fromDate")

	toDate :=
		c.Query("toDate")

	// =====================================
	// TICKET ID FILTER
	// =====================================

	ticketID, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"ticketId",
				"0",
			),
		)

	// =====================================
	// SORTING
	// =====================================

	sortBy :=
		c.DefaultQuery(
			"sortBy",
			"created_at",
		)

	sortOrder :=
		c.DefaultQuery(
			"sortOrder",
			"DESC",
		)

	// =====================================
	// GET TICKETS
	// =====================================

	response, err :=
		h.ticketService.GetTickets(
			database.DB,
			page,
			pageSize,
			status,
			ticketType,
			priority,
			search,
			ticketID,
			customerName,
			projectName,
			companyName,
			assignedTo,
			fromDate,
			toDate,
			sortBy,
			sortOrder,
			userID,
			role,
		)

	if err != nil {

		message :=
			err.Error()

		statusCode :=
			http.StatusInternalServerError

		errorCode :=
			"INTERNAL_ERROR"

		// =====================================
		// INVALID TICKET ID
		// =====================================

		if strings.Contains(
			strings.ToLower(message),
			"invalid ticket",
		) {

			statusCode =
				http.StatusBadRequest

			errorCode =
				"INVALID_TICKET_ID"
		}

		// =====================================
		// TICKET NOT FOUND
		// =====================================

		if strings.Contains(
			strings.ToLower(message),
			"not found",
		) {

			statusCode =
				http.StatusNotFound

			errorCode =
				"TICKET_NOT_FOUND"
		}

		c.JSON(
			statusCode,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    errorCode,
					Message: message,
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
			Data:    response,
		},
	)
}

// ExportTickets godoc
// @Summary Export tickets
// @Description Export all tickets based on filters
// @Tags tickets
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10000)
// @Param status query string false "Filter by status"
// @Param priority query string false "Filter by priority"
// @Param search query string false "Search keyword"
// @Success 200 {array} models.Ticket
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/export [get]
func (h *TicketHandler) ExportTickets(c *gin.Context) {

	page, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"page",
				"1",
			),
		)

	pageSize, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"pageSize",
				"10000",
			),
		)

	// =====================================
	// GET USER ID
	// =====================================

	userIDValue, exists :=
		c.Get("userID")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "User not authorized",
				},
			},
		)

		return
	}

	userID :=
		userIDValue.(int)

	// =====================================
	// GET ROLE
	// =====================================

	roleValue, exists :=
		c.Get("role")

	if !exists {

		c.JSON(
			http.StatusUnauthorized,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "UNAUTHORIZED",
					Message: "Role not found",
				},
			},
		)

		return
	}

	role :=
		roleValue.(string)

	// =====================================
	// FILTERS
	// =====================================

	status :=
		c.Query("status")

	ticketType :=
		c.Query("ticketType")

	priority :=
		c.Query("priority")

	search :=
		c.Query("search")

	customerName :=
		c.Query("customerName")

	projectName :=
		c.Query("projectName")

	companyName :=
		c.Query("companyName")

	assignedTo, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"assignedTo",
				"0",
			),
		)
	fromDate :=
		c.Query("fromDate")

	toDate :=
		c.Query("toDate")

	// =====================================
	// TICKET ID FILTER
	// =====================================

	ticketID, _ :=
		strconv.Atoi(
			c.DefaultQuery(
				"ticketId",
				"0",
			),
		)

	// =====================================
	// SORTING
	// =====================================

	sortBy :=
		c.DefaultQuery(
			"sortBy",
			"created_at",
		)

	sortOrder :=
		c.DefaultQuery(
			"sortOrder",
			"DESC",
		)

	// =====================================
	// GET TICKETS
	// =====================================

	response, err :=
		h.ticketService.GetTickets(
			database.DB,
			page,
			pageSize,
			status,
			ticketType,
			priority,
			search,
			ticketID,
			customerName,
			projectName,
			companyName,
			assignedTo,
			fromDate,
			toDate,
			sortBy,
			sortOrder,
			userID,
			role,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INTERNAL_ERROR",
					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// CREATE EXCEL
	// =====================================

	file :=
		excelize.NewFile()

	sheet :=
		"Tickets"

	file.SetSheetName(
		"Sheet1",
		sheet,
	)

	// =====================================
	// HEADERS
	// =====================================

	headers := []string{
		"Ticket ID",
		"Title",
		"Customer Name",
		"Company Name",
		"Project",
		"Priority",
		"Status",
		"Ticket Type",
		"Assigned To",
		"Created At",
	}

	for i, header := range headers {

		cell, _ :=
			excelize.CoordinatesToCellName(
				i+1,
				1,
			)

		file.SetCellValue(
			sheet,
			cell,
			header,
		)
	}

	// =====================================
	// DATA
	// =====================================

	for index, ticket := range response.Tickets {

		row := index + 2

		projectNameValue := ""

		if ticket.ProjectName != nil {

			projectNameValue =
				*ticket.ProjectName
		}

		customerNameValue := ""

		if ticket.CustomerName != nil {

			customerNameValue =
				*ticket.CustomerName
		}

		companyNameValue := ""

		if ticket.CompanyName != nil {

			companyNameValue =
				*ticket.CompanyName
		}

		assignedToName := ""

		if ticket.AssignedToName != nil {

			assignedToName =
				*ticket.AssignedToName
		}

		file.SetCellValue(
			sheet,
			fmt.Sprintf("A%d", row),
			ticket.TicketID,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("B%d", row),
			ticket.Title,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("C%d", row),
			customerNameValue,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("D%d", row),
			companyNameValue,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("E%d", row),
			projectNameValue,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("F%d", row),
			ticket.Priority,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("G%d", row),
			ticket.Status,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("H%d", row),
			ticket.TicketType,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("I%d", row),
			assignedToName,
		)

		file.SetCellValue(
			sheet,
			fmt.Sprintf("J%d", row),
			ticket.CreatedAt.Format(
				"2006-01-02 15:04:05",
			),
		)
	}

	// =====================================
	// AUTO COLUMN WIDTH
	// =====================================

	file.SetColWidth(
		sheet,
		"A",
		"J",
		25,
	)

	// =====================================
	// WRITE TO BUFFER
	// =====================================

	buffer :=
		new(bytes.Buffer)

	if err :=
		file.Write(buffer); err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "EXPORT_FAILED",
					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// DOWNLOAD HEADERS
	// =====================================

	c.Header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	)

	c.Header(
		"Content-Disposition",
		`attachment; filename="tickets.xlsx"`,
	)

	c.Header(
		"Content-Transfer-Encoding",
		"binary",
	)

	// =====================================
	// RETURN FILE
	// =====================================

	c.Data(
		http.StatusOK,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		buffer.Bytes(),
	)
}

// GetTicketByID godoc
// @Summary Get ticket by ID
// @Description Retrieve a specific ticket by ID
// @Tags tickets
// @Produce json
// @Security BearerAuth
// @Param ticketID path int true "Ticket ID"
// @Success 200 {object} models.TicketDetail
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/{ticketID} [get]
func (h *TicketHandler) GetTicketByID(c *gin.Context) {

	ticketID, err := strconv.Atoi(c.Param("ticketID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_ID",
				Message: "Invalid ticket ID",
			},
		})
		return
	}

	ticket, err := h.ticketService.GetTicketByID(database.DB, ticketID)
	if err != nil {

		statusCode := http.StatusInternalServerError
		errorCode := "INTERNAL_ERROR"

		if err == services.ErrTicketNotFound {
			statusCode = http.StatusNotFound
			errorCode = "TICKET_NOT_FOUND"
		}

		c.JSON(statusCode, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    errorCode,
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data:    ticket,
	})
}

// CreateTicket godoc
// @Summary Create ticket
// @Description Create a new ticket
// @Tags tickets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param ticket body models.TicketCreate true "Ticket payload"
// @Success 201 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets [post]
func (h *TicketHandler) CreateTicket(c *gin.Context) {

	var ticket models.TicketCreate

	if err := c.ShouldBindJSON(&ticket); err != nil {

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: err.Error(),
			},
		})
		return
	}

	userIDValue, exists := c.Get("userID")
	if !exists {

		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userID, ok := userIDValue.(int)
	if !ok {

		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_USER",
				Message: "Invalid user context",
			},
		})
		return
	}

	createdTicket, err := h.ticketService.CreateTicket(
		database.DB,
		&ticket,
		userID,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "CREATE_FAILED",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse{
		Success: true,
		Data:    createdTicket,
	})
}

// UpdateTicket godoc
// @Summary Update ticket
// @Description Update an existing ticket
// @Tags tickets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param ticketID path int true "Ticket ID"
// @Param ticket body models.TicketUpdate true "Ticket update payload"
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/{ticketID} [put]
func (h *TicketHandler) UpdateTicket(c *gin.Context) {

	ticketID, err := strconv.Atoi(c.Param("ticketID"))
	if err != nil {

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_ID",
				Message: "Invalid ticket ID",
			},
		})
		return
	}

	var ticket models.TicketUpdate

	if err := c.ShouldBindJSON(&ticket); err != nil {

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: err.Error(),
			},
		})
		return
	}

	userIDValue, exists := c.Get("userID")
	if !exists {

		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userID, ok := userIDValue.(int)
	if !ok {

		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_USER",
				Message: "Invalid user context",
			},
		})
		return
	}

	updatedTicket, err := h.ticketService.UpdateTicket(
		database.DB,
		ticketID,
		&ticket,
		userID,
	)

	if err != nil {

		statusCode := http.StatusInternalServerError
		errorCode := "UPDATE_FAILED"

		if err == services.ErrTicketNotFound {
			statusCode = http.StatusNotFound
			errorCode = "TICKET_NOT_FOUND"
		}

		c.JSON(statusCode, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    errorCode,
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data:    updatedTicket,
	})
}

// DeleteTicket handles deleting a ticket
// @Summary Delete a ticket
// @Description Delete a ticket
// @Tags tickets
// @Produce json
// @Param id path int true "Ticket ID"
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/{id} [delete]
func (h *TicketHandler) DeleteTicket(c *gin.Context) {
	ticketID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_ID",
				Message: "Invalid ticket ID",
			},
		})
		return
	}

	// Get user ID from context
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	err = h.ticketService.DeleteTicket(database.DB, ticketID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INTERNAL_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Ticket deleted successfully",
	})
}

// AddComment handles adding a comment to a ticket
// @Summary Add comment
// @Description Add a new comment to a specific ticket
// @Tags comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param ticketID path int true "Ticket ID"
// @Param comment body models.CommentCreate true "Comment payload"
// @Success 201 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/{ticketID}/comments [post]
func (h *TicketHandler) AddComment(
	c *gin.Context,
) {

	// =====================================
	// GET TICKET ID
	// =====================================

	ticketIDParam := c.Param(
		"ticketID",
	)

	ticketID, err := strconv.Atoi(
		ticketIDParam,
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid ticket ID",
				},
			},
		)

		return
	}

	// =====================================
	// REQUEST BODY
	// =====================================

	var comment models.CommentCreate

	if err := c.ShouldBindJSON(
		&comment,
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

	// =====================================
	// GET AUTHENTICATED USER
	// =====================================

	userIDValue, exists := c.Get(
		"userID",
	)

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

	userID, ok := userIDValue.(int)

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

	// =====================================
	// CREATE COMMENT
	// =====================================

	createdComment, err :=
		h.ticketService.AddComment(
			database.DB,
			ticketID,
			&comment,
			userID,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "CREATE_COMMENT_FAILED",
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
		http.StatusCreated,
		models.SuccessResponse{
			Success: true,
			Data:    createdComment,
		},
	)
}

// UpdateComment handles updating a comment
// @Summary Update a comment
// @Description Update a comment
// @Tags comments
// @Produce json
// @Param commentID path int true "Comment ID"
// @Param comment body models.CommentCreate true "Comment data to update"
// @Success 200 {object} models.Comment
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/comments/{commentID} [put]
func (h *TicketHandler) UpdateComment(c *gin.Context) {
	commentID, err := strconv.Atoi(c.Param("commentID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_ID",
				Message: "Invalid comment ID",
			},
		})
		return
	}

	var comment models.CommentCreate
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_REQUEST",
				Message: err.Error(),
			},
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	updatedComment, err := h.ticketService.UpdateComment(database.DB, commentID, &comment, userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "COMMENT_NOT_FOUND",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data:    updatedComment,
	})
}

// DeleteComment handles deleting a comment
// @Summary Delete a comment
// @Description Delete a comment by comment ID
// @Tags comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param ticketID path int true "Ticket ID"
// @Param commentID path int true "Comment ID"
// @Success 200 {object} models.SuccessResponse "Comment deleted successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid ID"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Comment not found"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /api/tickets/{ticketID}/comments/{commentID} [delete]
func (h *TicketHandler) DeleteComment(c *gin.Context) {

	commentID, err :=
		strconv.Atoi(
			c.Param(
				"commentID",
			),
		)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid comment ID",
				},
			},
		)

		return
	}

	// =====================================
	// CHECK AUTH
	// =====================================

	_, exists :=
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

	// =====================================
	// DELETE COMMENT
	// =====================================

	err =
		h.ticketService.DeleteComment(
			database.DB,
			commentID,
		)

	if err != nil {

		c.JSON(
			http.StatusNotFound,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "COMMENT_NOT_FOUND",
					Message: err.Error(),
				},
			},
		)

		return
	}

	// =====================================
	// SUCCESS
	// =====================================

	c.JSON(
		http.StatusOK,
		models.SuccessResponse{
			Success: true,
			Message: "Comment deleted successfully",
		},
	)
}

// @Summary Get comments
// @Description Get all comments for a specific ticket
// @Tags comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param ticketID path int true "Ticket ID"
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/tickets/{ticketID}/comments [get]
func (h *TicketHandler) GetComments(
	c *gin.Context,
) {

	ticketIDParam := c.Param("ticketID")

	ticketID, err := strconv.Atoi(
		ticketIDParam,
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid ticket ID",
				},
			},
		)

		return
	}

	comments, err :=
		h.ticketService.GetComments(
			database.DB,
			ticketID,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "GET_COMMENTS_FAILED",
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
			Data:    comments,
		},
	)
}

// / AddAttachment handles adding an attachment to a ticket
//
// @Summary Add attachment
// @Description Upload and attach a file to a specific ticket (supports both file upload and base64)
// @Tags attachments
// @Accept multipart/form-data, application/json
// @Produce json
// @Security BearerAuth
//
// @Param ticketID path int true "Ticket ID"
//
// @Param file formData file false "Attachment File (for multipart)"
// @Param base64 formData string false "Base64 encoded data (for JSON)"
// @Param fileName formData string false "File name (for JSON)"
// @Param fileType formData string false "File type/MIME type (for JSON)"
//
// @Success 201 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
//
// @Router /api/tickets/{ticketID}/attachments [post]
func (h *TicketHandler) AddAttachment(
	c *gin.Context,
) {

	// =====================================
	// GET TICKET ID
	// =====================================

	ticketIDParam :=
		c.Param("ticketID")

	ticketID, err :=
		strconv.Atoi(ticketIDParam)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code:    "INVALID_ID",
					Message: "Invalid ticket ID",
				},
			},
		)

		return
	}

	// =====================================
	// AUTH CHECK
	// =====================================

	userID, exists :=
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

	// =====================================
	// CHECK CONTENT TYPE
	// =====================================

	contentType := c.ContentType()

	if strings.Contains(contentType, "application/json") {

		// =====================================
		// HANDLE BASE64 JSON REQUEST
		// =====================================

		var attachmentData models.AttachmentCreate

		if err := c.ShouldBindJSON(&attachmentData); err != nil {

			c.JSON(
				http.StatusBadRequest,
				models.ErrorResponse{
					Success: false,
					Error: models.Error{
						Code:    "INVALID_REQUEST",
						Message: "Invalid request body",
					},
				},
			)

			return
		}

		// Validate base64 data
		if attachmentData.Base64Data == nil ||
			*attachmentData.Base64Data == "" {

			c.JSON(
				http.StatusBadRequest,
				models.ErrorResponse{
					Success: false,
					Error: models.Error{
						Code:    "BASE64_REQUIRED",
						Message: "Base64 data is required",
					},
				},
			)

			return
		}

		// =====================================
		// ADD BASE64 ATTACHMENT
		// =====================================

		attachment, err :=
			h.ticketService.AddAttachmentFromBase64(
				database.DB,
				ticketID,
				*attachmentData.Base64Data,
				*attachmentData.FileName,
				*attachmentData.FileType,
				userID.(int),
			)

		if err != nil {

			c.JSON(
				http.StatusInternalServerError,
				models.ErrorResponse{
					Success: false,
					Error: models.Error{
						Code:    "ADD_ATTACHMENT_FAILED",
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
			http.StatusCreated,
			models.SuccessResponse{
				Success: true,
				Data:    attachment,
			},
		)

	} else {

		// =====================================
		// HANDLE MULTIPART FILE UPLOAD
		// =====================================

		// GET FILE
		file, err :=
			c.FormFile("file")

		if err != nil {

			c.JSON(
				http.StatusBadRequest,
				models.ErrorResponse{
					Success: false,
					Error: models.Error{
						Code:    "FILE_REQUIRED",
						Message: "Attachment file is required",
					},
				},
			)

			return
		}

		// =====================================
		// ADD ATTACHMENT
		// =====================================

		attachment, err :=
			h.ticketService.AddAttachmentFromFile(
				database.DB,
				ticketID,
				file,
				userID.(int),
			)

		if err != nil {

			c.JSON(
				http.StatusInternalServerError,
				models.ErrorResponse{
					Success: false,
					Error: models.Error{
						Code:    "ADD_ATTACHMENT_FAILED",
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
			http.StatusCreated,
			models.SuccessResponse{
				Success: true,
				Data:    attachment,
			},
		)
	}
}

// DeleteAttachment handles deleting an attachment
// @Summary Delete an attachment
// @Description Delete an attachment
// @Tags attachments
// @Produce json
// @Param attachmentID path int true "Attachment ID"
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/attachments/{attachmentID} [delete]
func (h *TicketHandler) DeleteAttachment(c *gin.Context) {
	attachmentID, err := strconv.Atoi(c.Param("attachmentID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "INVALID_ID",
				Message: "Invalid attachment ID",
			},
		})
		return
	}

	err = h.ticketService.DeleteAttachment(database.DB, attachmentID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error: models.Error{
				Code:    "ATTACHMENT_NOT_FOUND",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Attachment deleted successfully",
	})
}

// GetSLAMetrics godoc
//
//	@Summary		Get SLA metrics
//	@Description	Get dashboard SLA metrics including average first response time, average resolution time, and SLA compliance percentage
//	@Tags			Tickets
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//
//	@Success		200	{object}	models.SuccessResponse{data=models.SLAMetrics}
//
//	@Failure		401	{object}	models.ErrorResponse
//	@Failure		500	{object}	models.ErrorResponse
//
//	@Router			/api/tickets/sla-metrics [get]
func (h *TicketHandler) GetSLAMetrics(
	c *gin.Context,
) {

	metrics,
		err := h.ticketService.GetSLAMetrics(
		database.DB,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{

				Success: false,

				Error: models.Error{

					Code: "SLA_METRICS_FETCH_FAILED",

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

			Data: metrics,
		},
	)
}
