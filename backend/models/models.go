package models

import (
	"time"
)

type UserMaster struct {
	UserID int `json:"userId"`

	Name string `json:"name"`

	CompanyName *string `json:"companyName"`

	CompanyMail *string `json:"companyMail"`

	EmpID *string `json:"empId"`

	Email string `json:"email"`

	Password *string `json:"-"`

	Designation *string `json:"designation"`

	ReportTo *int `json:"reportTo"`

	ReportToName *string `json:"reportToName"`

	CreatedBy *int `json:"createdBy"`

	CreatedOn time.Time `json:"createdOn"`

	UpdatedBy *int `json:"updatedBy"`

	UpdatedOn time.Time `json:"updatedOn"`

	TraceID string `json:"traceId"`

	TotalTickets int `json:"totalTickets"`

	OpenCount int `json:"openCount"`

	InProgressCount int `json:"inProgressCount"`

	OnHoldCount int `json:"onHoldCount"`

	ClosedCount int `json:"closedCount"`
}

type UserListResponse struct {
	Users []UserMaster `json:"users"`

	Pagination Pagination `json:"pagination"`
}

// User represents a user in the system
type User struct {
	UserID      int       `json:"userId"`
	Name        string    `json:"name"`
	CompanyName string    `json:"companyName"`
	CompanyMail *string   `json:"companyMail"`
	EmpID       string    `json:"empId"`
	Email       string    `json:"email"`
	Password    string    `json:"-"` // Don't expose password in JSON
	Designation string    `json:"designation"`
	Role        string    `json:"role"`
	ReportTo    *int      `json:"reportTo"`
	TraceID     string    `json:"traceId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UserUpdate struct {
	Name *string `json:"name"`

	CompanyName *string `json:"companyName"`

	CompanyMail *string `json:"companyMail"`

	EmpID *string `json:"empId"`

	Email *string `json:"email"`

	Designation *string `json:"designation"`

	ReportTo *int `json:"reportTo"`
}

// UserLogin represents login credentials
type UserLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UserRegister represents registration data
type UserRegister struct {
	Name        string  `json:"name"`
	Email       string  `json:"email"`
	Password    string  `json:"password"`
	CompanyName string  `json:"companyName"`
	CompanyMail *string `json:"companyMail"`
	Designation string  `json:"designation"`
	EmpID       string  `json:"empId"`
	ReportTo    *int    `json:"reportTo"`
}

// UserResponse represents the response for authentication endpoints
type UserResponse struct {
	UserID      int    `json:"userId"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Designation string `json:"designation"`
	CompanyName string `json:"companyName"`
	TraceID     string `json:"traceId"`
	Role        string `json:"role"`
}

// TokenResponse represents JWT token response
type TokenResponse struct {
	Token     string       `json:"token"`
	ExpiresIn int64        `json:"expiresIn"`
	User      UserResponse `json:"user"`
}

// Ticket represents a ticket in the system
type Ticket struct {
	TicketID int64 `json:"ticketId"`

	Title string `json:"title"`

	CustomerName   *string `json:"customerName"`
	EmployeeName   *string `json:"employeeName"`
	ProjectName    *string `json:"projectName"`
	CompanyName    *string `json:"companyName"`
	CreatedByName  *string `json:"createdByName"`
	CreatedByEmail *string `json:"createdByEmail"`

	ProjectID  *int `json:"projectId"`
	AssignedTo *int `json:"assignedTo"`

	TicketType string `json:"ticketType"`

	Priority string `json:"priority"`

	Description *string `json:"description"`

	SoNumber *string `json:"soNumber,omitempty"`

	Status string `json:"status"`

	DueDate *time.Time `json:"dueDate"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	TraceID string `json:"traceId"`

	CreatedBy      *int    `json:"createdBy"`
	UpdatedBy      *int    `json:"updatedBy"`
	AssignedToName *string `json:"assignedToName"`
}

// TicketCreate represents data for creating a ticket
type TicketCreate struct {
	Title string `json:"title" binding:"required"`

	CustomerName *string `json:"customerName"`

	EmployeeName *string `json:"employeeName"`

	ProjectName *string `json:"projectName"`

	CompanyName *string `json:"companyName"`

	// OPTIONAL

	ProjectID *int `json:"projectId"`

	AssignedTo *int `json:"assignedTo"`

	SoNumber *string `json:"soNumber,omitempty"`

	TicketType string `json:"ticketType" binding:"required"`

	Priority string `json:"priority" binding:"required"`

	Description *string `json:"description"`

	DueDate *time.Time `json:"dueDate" example:"2026-12-31T00:00:00Z"`
}

// TicketUpdate represents data for updating a ticket
type TicketUpdate struct {
	Title *string `json:"title"`

	CustomerName *string `json:"customerName"`

	EmployeeName *string `json:"employeeName"`

	ProjectName *string `json:"projectName"`

	CompanyName *string `json:"companyName"`

	ProjectID *int `json:"projectId"`

	AssignedTo *int `json:"assignedTo"`

	TicketType *string `json:"ticketType"`

	Priority *string `json:"priority"`

	Description *string `json:"description"`

	SoNumber *string `json:"soNumber,omitempty"`

	Status *string `json:"status"`

	DueDate *time.Time `json:"dueDate"`
}

type TicketStats struct {
	TotalItems int `json:"totalItems"`

	OpenCount int `json:"openCount"`

	ClosedCount int `json:"closedCount"`

	OnHoldCount int `json:"onHoldCount"`

	InProgressCount int `json:"inProgressCount"`

	CriticalCount int `json:"criticalCount"`

	HighCount int `json:"highCount"`

	MediumCount int `json:"mediumCount"`

	LowCount int `json:"lowCount"`
}

type CompanyUser struct {
	UserID int `json:"userId"`

	Name string `json:"name"`
}

// TicketListResponse represents paginated ticket list response
type TicketListResponse struct {
	Tickets    []Ticket    `json:"tickets"`
	Pagination Pagination  `json:"pagination"`
	Stats      TicketStats `json:"stats"`
}

// Pagination represents pagination metadata
type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	TotalItems int `json:"totalItems"`
	TotalPages int `json:"totalPages"`
}

// Comment represents a comment on a ticket
type Comment struct {
	CommentID   int64        `json:"commentId"`
	TicketID    int64        `json:"ticketId"`
	UserName    string       `json:"userName"`
	Message     string       `json:"message"`
	CreatedAt   time.Time    `json:"createdAt"`
	TraceID     string       `json:"traceId"`
	CreatedBy   *int         `json:"createdBy"`
	UpdatedBy   *int         `json:"updatedBy"`
	Attachments []Attachment `json:"attachments"`
}

// CommentCreate represents data for creating a comment
type CommentCreate struct {
	UserName    string             `json:"userName"`
	Message     string             `json:"message"`
	Attachments []AttachmentCreate `json:"attachments"`
}

// Attachment represents an attachment
type Attachment struct {
	AttachmentID int64 `json:"attachmentId"`

	TicketID *int64 `json:"ticketId"`

	URL string `json:"url"`

	Base64Data *string `json:"base64Data,omitempty"`

	FileName *string `json:"fileName,omitempty"`

	FileType *string `json:"fileType,omitempty"`

	CreatedAt time.Time `json:"createdAt"`

	CommentID *int64 `json:"commentId"`
}

// AttachmentCreate represents data for creating an attachment
type AttachmentCreate struct {
	URL string `json:"url"`

	Base64Data *string `json:"base64,omitempty"`

	FileName *string `json:"fileName,omitempty"`

	FileType *string `json:"fileType,omitempty"`
}

// TicketDetail represents a ticket with its comments and attachments
type TicketDetail struct {
	TicketID int64 `json:"ticketId"`

	Title string `json:"title"`

	CustomerName *string `json:"customerName"`
	EmployeeName *string `json:"employeeName"`
	ProjectName  *string `json:"projectName"`

	ProjectID  *int `json:"projectId"`
	AssignedTo *int `json:"assignedTo"`

	TicketType string `json:"ticketType"`

	Priority string `json:"priority"`

	Description *string `json:"description"`

	SoNumber *string `json:"soNumber,omitempty"`

	Status string `json:"status"`

	DueDate *time.Time `json:"dueDate"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	TraceID string `json:"traceId"`

	CreatedBy *int `json:"createdBy"`
	UpdatedBy *int `json:"updatedBy"`

	Comments    []Comment    `json:"comments"`
	Attachments []Attachment `json:"attachments"`
}

// Status represents ticket status
type Status string

const (
	StatusOpen       Status = "Open"
	StatusAssigned   Status = "Assigned"
	StatusInProgress Status = "InProgress"
	StatusClosed     Status = "Closed"
)

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool  `json:"success"`
	Error   Error `json:"error"`
}

// Error represents an error object
type Error struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// SuccessResponse represents a success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

type Company struct {
	CompanyName string `json:"companyName"`
	CompanyID   int    `json:"companyId"`
}

type SLAMetrics struct {
	AvgFirstResponseHours float64 `json:"avgFirstResponseHours"`

	AvgResolutionHours float64 `json:"avgResolutionHours"`

	SLACompliance float64 `json:"slaCompliance"`

	NoDueDateCount int `json:"noDueDateCount"`

	OverdueCount int `json:"overdueCount"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token string `json:"token"`

	NewPassword string `json:"newPassword"`
}
