package services

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"ticket-management-system/models"
)

var (
	ErrTicketNotFound = errors.New("ticket not found")
)

type TicketService struct{}

func NewTicketService() *TicketService {
	return &TicketService{}
}

// CreateTicket creates a new ticket
func (s *TicketService) CreateTicket(
	db *sql.DB,
	ticket *models.TicketCreate,
	createdBy int,
) (*models.Ticket, error) {

	var (
		ticketID int64
		traceID  string
	)

	// =====================================
	// CREATE TICKET
	// =====================================

	err := db.QueryRow(`

		EXEC sp_CreateTicket

			@title = @p1,

			@company_name = @p2,

			@customer_name = @p3,

			@employee_name = @p4,

			@project_name = @p5,

			@project_id = @p6,

			@assigned_to = @p7,

			@ticket_type = @p8,

			@priority = @p9,

			@description = @p10,

			@due_date = @p11,

            @so_number = @p12,

            @created_by = @p13

	`,
		ticket.Title,

		ticket.CompanyName,

		ticket.CustomerName,

		ticket.EmployeeName,

		ticket.ProjectName,

		ticket.ProjectID,

		ticket.AssignedTo,

		ticket.TicketType,

		ticket.Priority,

		ticket.Description,

		ticket.DueDate,

		ticket.SoNumber,

		createdBy,
	).Scan(
		&ticketID,
		&traceID,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to create ticket: %w",
				err,
			)
	}

	// =====================================
	// AUTO GET COMPANY NAME
	// FOR NORMAL USERS
	// =====================================

	if ticket.CompanyName == nil {

		var userCompany sql.NullString

		err = db.QueryRow(`

			SELECT company_name

			FROM UserMaster

			WHERE user_id = @p1

		`,
			createdBy,
		).Scan(
			&userCompany,
		)

		if err == nil && userCompany.Valid {

			ticket.CompanyName =
				&userCompany.String
		}
	}

	// =====================================
	// GET CREATOR EMAIL + COMPANY MAIL
	// =====================================

	var creatorEmail string

	var companyMail sql.NullString

	err = db.QueryRow(`

	SELECT

		email,

		company_mail

	FROM UserMaster

	WHERE user_id = @p1

`,
		createdBy,
	).Scan(

		&creatorEmail,

		&companyMail,
	)

	if err != nil {

		fmt.Println(
			"FAILED TO GET USER EMAIL:",
			err,
		)

	} else {

		// =================================
		// DESCRIPTION
		// =================================

		description := ""

		if ticket.Description != nil {

			description =
				*ticket.Description
		}

		// =================================
		// BUILD CC EMAIL LIST
		// =================================

		var ccEmails []string

		if companyMail.Valid &&
			companyMail.String != "" {

			ccEmails =
				strings.Split(
					companyMail.String,
					",",
				)

			for i := range ccEmails {

				ccEmails[i] =
					strings.TrimSpace(
						ccEmails[i],
					)
			}
		}

		// =================================
		// SEND EMAIL ASYNC
		// =================================

		emailService :=
			NewEmailService()

		go func() {

			err :=
				emailService.SendTicketCreatedEmail(

					creatorEmail,

					ccEmails,

					ticketID,

					ticket.Title,

					description,
				)

			if err != nil {

				fmt.Println(
					"EMAIL SEND ERROR:",
					err,
				)
			}

		}()
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Ticket{

		TicketID: ticketID,

		Title: ticket.Title,

		CompanyName: ticket.CompanyName,

		CustomerName: ticket.CustomerName,

		EmployeeName: ticket.EmployeeName,

		ProjectName: ticket.ProjectName,

		ProjectID: ticket.ProjectID,

		AssignedTo: ticket.AssignedTo,

		TicketType: ticket.TicketType,

		Priority: ticket.Priority,

		Description: ticket.Description,

		SoNumber: ticket.SoNumber,

		Status: "Open",

		DueDate: ticket.DueDate,

		CreatedAt: time.Now().UTC(),

		UpdatedAt: time.Now().UTC(),

		TraceID: traceID,

		CreatedBy: &createdBy,

		UpdatedBy: &createdBy,
	}, nil
}

// GetTicketByID retrieves a ticket by ID with comments and attachments
func (s *TicketService) GetTicketByID(
	db *sql.DB,
	ticketID int64,
) (*models.TicketDetail, error) {

	query := `
SELECT
	t.ticket_id,
	t.title,
	t.customer_name,
	t.employee_name,
	t.project_name,
	t.project_id,
	t.assigned_to,
	t.ticket_type,
	t.priority,
	t.description,
	t.so_number,
	t.status,
	t.due_date,
	t.created_at,
	t.updated_at,
	t.traceid,
	t.createdby,
	t.updatedby
FROM tickets t
WHERE t.ticket_id = @p1
`

	var (
		ticketIDOut  int64
		title        string
		customerName sql.NullString
		employeeName sql.NullString
		projectName  sql.NullString
		projectID    sql.NullInt64
		assignedTo   sql.NullInt64
		ticketType   string
		priority     string
		description  sql.NullString
		soNumber     sql.NullString
		status       string
		dueDate      sql.NullTime
		createdAt    sql.NullTime
		updatedAt    sql.NullTime
		traceID      string
		createdBy    sql.NullInt64
		updatedBy    sql.NullInt64
	)

	err := db.QueryRow(query, ticketID).Scan(
		&ticketIDOut,
		&title,
		&customerName,
		&employeeName,
		&projectName,
		&projectID,
		&assignedTo,
		&ticketType,
		&priority,
		&description,
		&soNumber,
		&status,
		&dueDate,
		&createdAt,
		&updatedAt,
		&traceID,
		&createdBy,
		&updatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, ErrTicketNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get ticket: %w", err)
	}

	// Convert nullable types to pointers
	var customerNamePtr *string
	if customerName.Valid {
		customerNamePtr = &customerName.String
	}

	var employeeNamePtr *string
	if employeeName.Valid {
		employeeNamePtr = &employeeName.String
	}

	var projectNamePtr *string
	if projectName.Valid {
		projectNamePtr = &projectName.String
	}

	var descriptionPtr *string
	if description.Valid {
		descriptionPtr = &description.String
	}

	var soNumberPtr *string
	if soNumber.Valid {
		soNumberPtr = &soNumber.String
	}

	var projectIDPtr *int
	if projectID.Valid {
		id := int(projectID.Int64)
		projectIDPtr = &id
	}

	var assignedToPtr *int
	if assignedTo.Valid {
		id := int(assignedTo.Int64)
		assignedToPtr = &id
	}

	var dueDatePtr *time.Time
	if dueDate.Valid {
		dueDatePtr = &dueDate.Time
	}

	var createdAtPtr *time.Time
	if createdAt.Valid {
		createdAtPtr = &createdAt.Time
	}

	var updatedAtPtr *time.Time
	if updatedAt.Valid {
		updatedAtPtr = &updatedAt.Time
	}

	var createdByPtr *int
	if createdBy.Valid {
		id := int(createdBy.Int64)
		createdByPtr = &id
	}

	var updatedByPtr *int
	if updatedBy.Valid {
		id := int(updatedBy.Int64)
		updatedByPtr = &id
	}

	// =====================================
	// GET ATTACHMENTS
	// =====================================
	attachmentRows, err := db.Query(`
	SELECT

		attachment_id,

		ticket_id,

		url,

		base64_data,

		file_name,

		file_type,

		created_at

	FROM attachments

	WHERE ticket_id = @p1
`,
		ticketID,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get attachments: %w",
				err,
			)
	}

	defer attachmentRows.Close()

	var attachments []models.Attachment

	for attachmentRows.Next() {

		var attachment models.Attachment
		var url sql.NullString
		var base64Data sql.NullString
		var fileName sql.NullString
		var fileType sql.NullString

		err := attachmentRows.Scan(

			&attachment.AttachmentID,

			&attachment.TicketID,

			&url,

			&base64Data,

			&fileName,

			&fileType,

			&attachment.CreatedAt,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan attachment: %w",
					err,
				)
		}

		// Set nullable fields
		if base64Data.Valid {

			attachment.Base64Data =
				&base64Data.String
		}

		if fileName.Valid {

			attachment.FileName =
				&fileName.String
		}

		if fileType.Valid {

			attachment.FileType =
				&fileType.String
		}

		attachments = append(
			attachments,
			attachment,
		)
	}

	return &models.TicketDetail{

		TicketID: ticketIDOut,

		Title: title,

		CustomerName: customerNamePtr,

		EmployeeName: employeeNamePtr,

		ProjectName: projectNamePtr,

		ProjectID: projectIDPtr,

		AssignedTo: assignedToPtr,

		TicketType: ticketType,

		Priority: priority,

		Description: descriptionPtr,

		SoNumber: soNumberPtr,

		Status: status,

		DueDate: dueDatePtr,

		CreatedAt: *createdAtPtr,

		UpdatedAt: *updatedAtPtr,

		TraceID: traceID,

		CreatedBy: createdByPtr,

		UpdatedBy: updatedByPtr,

		Attachments: attachments,
	}, nil
}

// GetTickets retrieves paginated tickets with filters
func (s *TicketService) GetTickets(
	db *sql.DB,
	page int,
	pageSize int,
	status string,
	ticketType string,
	priority string,
	search string,
	ticketID int64,
	customerName string,
	projectName string,
	companyName string,
	assignedTo int,
	fromDate string,
	toDate string,
	sortBy string,
	sortOrder string,
	userID int,
	role string,
) (*models.TicketListResponse, error) {

	offset :=
		(page - 1) * pageSize

	// =========================================
	// VALIDATE TICKET ID
	// =========================================

	if ticketID < 0 {

		return nil,
			fmt.Errorf(
				"ticket ID cannot be negative",
			)
	}

	// =========================================
	// CHECK TICKET EXISTS
	// =========================================

	if ticketID > 0 {

		var exists int

		err := db.QueryRow(`
			SELECT COUNT(*)
			FROM tickets
			WHERE ticket_id = @p1
		`,
			ticketID,
		).Scan(
			&exists,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to validate ticket ID: %w",
					err,
				)
		}

		if exists == 0 {

			return nil,
				fmt.Errorf(
					"ticket ID %d not found",
					ticketID,
				)
		}
	}

	// =========================================
	// BASE QUERY
	// =========================================

	query := `
SELECT

	t.ticket_id,

	t.title,

	t.customer_name,

	t.employee_name,

	t.project_name,

	t.company_name,

	creator.name AS created_by_name,

	creator.email AS created_by_email,

	t.project_id,

	t.assigned_to,

	u.name AS assigned_to_name,

	t.ticket_type,

	t.priority,

	t.description,

	t.status,

	t.due_date,

	t.created_at,

	t.updated_at,

	t.traceid,

	t.createdby,

	t.updatedby

FROM tickets t

LEFT JOIN UserMaster u
	ON u.user_id = t.assigned_to

LEFT JOIN UserMaster creator
	ON creator.user_id = t.createdby

WHERE 1 = 1
`

	args := []interface{}{}

	paramIndex := 1

	// =========================================
	// USER FILTER
	// =========================================

	if strings.ToLower(role) != "superadmin" {

		query += fmt.Sprintf(`
		AND
		(
			t.createdby = @p%d
			OR
			t.assigned_to = @p%d
		)
		`,
			paramIndex,
			paramIndex,
		)

		args = append(
			args,
			userID,
		)

		paramIndex++
	}

	// =========================================
	// STATUS FILTER
	// =========================================

	if status != "" {

		query += fmt.Sprintf(
			" AND t.status = @p%d",
			paramIndex,
		)

		args = append(
			args,
			status,
		)

		paramIndex++
	}

	// =========================================
	// TICKET TYPE FILTER
	// =========================================

	if ticketType != "" {

		query += fmt.Sprintf(
			" AND t.ticket_type = @p%d",
			paramIndex,
		)

		args = append(
			args,
			ticketType,
		)

		paramIndex++
	}

	// =========================================
	// PRIORITY FILTER
	// =========================================

	if priority != "" {

		query += fmt.Sprintf(
			" AND t.priority = @p%d",
			paramIndex,
		)

		args = append(
			args,
			priority,
		)

		paramIndex++
	}

	// =========================================
	// TICKET ID FILTER
	// =========================================

	if ticketID > 0 {

		query += fmt.Sprintf(
			" AND t.ticket_id = @p%d",
			paramIndex,
		)

		args = append(
			args,
			ticketID,
		)

		paramIndex++
	}

	// =========================================
	// CUSTOMER NAME FILTER
	// =========================================

	if customerName != "" {

		query += fmt.Sprintf(
			" AND t.customer_name LIKE @p%d",
			paramIndex,
		)

		args = append(
			args,
			"%"+customerName+"%",
		)

		paramIndex++
	}

	// =========================================
	// PROJECT NAME FILTER
	// =========================================

	if projectName != "" {

		query += fmt.Sprintf(
			" AND t.project_name LIKE @p%d",
			paramIndex,
		)

		args = append(
			args,
			"%"+projectName+"%",
		)

		paramIndex++
	}

	// =========================================
	// COMPANY NAME FILTER
	// =========================================

	if companyName != "" {

		query += fmt.Sprintf(
			" AND t.company_name LIKE @p%d",
			paramIndex,
		)

		args = append(
			args,
			"%"+companyName+"%",
		)

		paramIndex++
	}

	if assignedTo > 0 {

		query += fmt.Sprintf(
			" AND t.assigned_to = @p%d",
			paramIndex,
		)

		args = append(
			args,
			assignedTo,
		)

		paramIndex++
	}

	// =========================================
	// FROM DATE FILTER
	// =========================================

	if fromDate != "" {

		query += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) >= @p%d",
			paramIndex,
		)

		args = append(
			args,
			fromDate,
		)

		paramIndex++
	}

	// =========================================
	// TO DATE FILTER
	// =========================================

	if toDate != "" {

		query += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) <= @p%d",
			paramIndex,
		)

		args = append(
			args,
			toDate,
		)

		paramIndex++
	}

	// =========================================
	// SEARCH FILTER
	// =========================================

	if search != "" {

		query += fmt.Sprintf(`
		AND (
			t.title LIKE @p%d
			OR t.description LIKE @p%d
			OR t.project_name LIKE @p%d
			OR t.customer_name LIKE @p%d
			OR t.employee_name LIKE @p%d
			OR t.company_name LIKE @p%d
			OR creator.name LIKE @p%d
			OR creator.email LIKE @p%d
		)
		`,
			paramIndex,
			paramIndex,
			paramIndex,
			paramIndex,
			paramIndex,
			paramIndex,
			paramIndex,
			paramIndex,
		)

		searchPattern :=
			"%" + search + "%"

		args = append(
			args,
			searchPattern,
		)

		paramIndex++
	}

	// =========================================
	// SORTING
	// =========================================

	allowedSortColumns :=
		map[string]bool{

			"ticket_id":  true,
			"created_at": true,
			"updated_at": true,
			"title":      true,
			"priority":   true,
			"status":     true,
		}

	if !allowedSortColumns[sortBy] {

		sortBy =
			"created_at"
	}

	if sortOrder != "ASC" &&
		sortOrder != "DESC" {

		sortOrder =
			"DESC"
	}

	query += fmt.Sprintf(
		" ORDER BY t.%s %s",
		sortBy,
		sortOrder,
	)

	// =========================================
	// PAGINATION
	// =========================================

	query += fmt.Sprintf(`
	OFFSET @p%d ROWS
	FETCH NEXT @p%d ROWS ONLY
	`,
		paramIndex,
		paramIndex+1,
	)

	args = append(
		args,
		offset,
		pageSize,
	)

	// =========================================
	// EXECUTE QUERY
	// =========================================

	rows, err :=
		db.Query(
			query,
			args...,
		)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get tickets: %w",
				err,
			)
	}

	defer rows.Close()

	var tickets []models.Ticket

	for rows.Next() {

		var ticket models.Ticket

		var (
			customerNameDB sql.NullString
			employeeName   sql.NullString
			projectNameDB  sql.NullString
			description    sql.NullString
			companyNameDB  sql.NullString

			createdByName  sql.NullString
			createdByEmail sql.NullString

			projectID      sql.NullInt64
			assignedTo     sql.NullInt64
			assignedToName sql.NullString

			dueDate sql.NullTime

			createdAt sql.NullTime
			updatedAt sql.NullTime

			createdBy sql.NullInt64
			updatedBy sql.NullInt64
		)

		err := rows.Scan(
			&ticket.TicketID,
			&ticket.Title,
			&customerNameDB,
			&employeeName,
			&projectNameDB,
			&companyNameDB,
			&createdByName,
			&createdByEmail,
			&projectID,
			&assignedTo,
			&assignedToName,
			&ticket.TicketType,
			&ticket.Priority,
			&description,
			&ticket.Status,
			&dueDate,
			&createdAt,
			&updatedAt,
			&ticket.TraceID,
			&createdBy,
			&updatedBy,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan ticket: %w",
					err,
				)
		}

		if customerNameDB.Valid {

			ticket.CustomerName =
				&customerNameDB.String
		}

		if employeeName.Valid {

			ticket.EmployeeName =
				&employeeName.String
		}

		if projectNameDB.Valid {

			ticket.ProjectName =
				&projectNameDB.String
		}

		if companyNameDB.Valid {

			ticket.CompanyName =
				&companyNameDB.String
		}

		if createdByName.Valid {

			ticket.CreatedByName =
				&createdByName.String
		}

		if createdByEmail.Valid {

			ticket.CreatedByEmail =
				&createdByEmail.String
		}

		if description.Valid {

			ticket.Description =
				&description.String
		}

		if projectID.Valid {

			id := int(projectID.Int64)

			ticket.ProjectID =
				&id
		}

		if assignedTo.Valid {

			id := int(assignedTo.Int64)

			ticket.AssignedTo =
				&id
		}

		if assignedToName.Valid {

			ticket.AssignedToName =
				&assignedToName.String
		}

		if dueDate.Valid {

			ticket.DueDate =
				&dueDate.Time
		}

		if createdAt.Valid {

			ticket.CreatedAt =
				createdAt.Time
		}

		if updatedAt.Valid {

			ticket.UpdatedAt =
				updatedAt.Time
		}

		if createdBy.Valid {

			id := int(createdBy.Int64)

			ticket.CreatedBy =
				&id
		}

		if updatedBy.Valid {

			id := int(updatedBy.Int64)

			ticket.UpdatedBy =
				&id
		}

		tickets = append(
			tickets,
			ticket,
		)
	}

	// =========================================
	// COUNT QUERY
	// =========================================

	countQuery := `
	SELECT COUNT(*)

	FROM tickets t

	LEFT JOIN UserMaster creator
		ON creator.user_id = t.createdby

	WHERE 1 = 1
	`

	countArgs := []interface{}{}

	countIndex := 1

	if strings.ToLower(role) != "superadmin" {

		countQuery += fmt.Sprintf(`
		AND
		(
			t.createdby = @p%d
			OR
			t.assigned_to = @p%d
		)
		`,
			countIndex,
			countIndex,
		)

		countArgs = append(
			countArgs,
			userID,
		)

		countIndex++
	}

	if status != "" {

		countQuery += fmt.Sprintf(
			" AND t.status = @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			status,
		)

		countIndex++
	}

	if ticketType != "" {

		countQuery += fmt.Sprintf(
			" AND t.ticket_type = @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			ticketType,
		)

		countIndex++
	}

	if priority != "" {

		countQuery += fmt.Sprintf(
			" AND t.priority = @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			priority,
		)

		countIndex++
	}

	if ticketID > 0 {

		countQuery += fmt.Sprintf(
			" AND t.ticket_id = @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			ticketID,
		)

		countIndex++
	}

	if customerName != "" {

		countQuery += fmt.Sprintf(
			" AND t.customer_name LIKE @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			"%"+customerName+"%",
		)

		countIndex++
	}

	if projectName != "" {

		countQuery += fmt.Sprintf(
			" AND t.project_name LIKE @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			"%"+projectName+"%",
		)

		countIndex++
	}

	if companyName != "" {

		countQuery += fmt.Sprintf(
			" AND t.company_name LIKE @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			"%"+companyName+"%",
		)

		countIndex++
	}

	if assignedTo > 0 {

		countQuery += fmt.Sprintf(
			" AND t.assigned_to = @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			assignedTo,
		)

		countIndex++
	}

	if fromDate != "" {

		countQuery += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) >= @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			fromDate,
		)

		countIndex++
	}

	if toDate != "" {

		countQuery += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) <= @p%d",
			countIndex,
		)

		countArgs = append(
			countArgs,
			toDate,
		)

		countIndex++
	}

	if search != "" {

		countQuery += fmt.Sprintf(`
		AND (
			t.title LIKE @p%d
			OR t.description LIKE @p%d
			OR t.project_name LIKE @p%d
			OR t.customer_name LIKE @p%d
			OR t.employee_name LIKE @p%d
			OR t.company_name LIKE @p%d
		)
		`,
			countIndex,
			countIndex,
			countIndex,
			countIndex,
			countIndex,
			countIndex,
		)

		searchPattern :=
			"%" + search + "%"

		countArgs = append(
			countArgs,
			searchPattern,
		)

		countIndex++
	}

	var totalItems int

	err = db.QueryRow(
		countQuery,
		countArgs...,
	).Scan(
		&totalItems,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to count tickets: %w",
				err,
			)
	}

	totalPages := 0

	if totalItems > 0 {

		totalPages =
			(totalItems + pageSize - 1) /
				pageSize
	}

	// =========================================
	// STATS QUERY
	// =========================================

	statsQuery := `
SELECT

    COUNT(*) AS total_items,

    -- =================================
    -- STATUS COUNTS
    -- =================================

    ISNULL(SUM(
        CASE
            WHEN t.status = 'Open'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN t.status = 'Closed'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN t.status = 'OnHold'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN t.status = 'InProgress'
            THEN 1
            ELSE 0
        END
    ), 0),

    -- =================================
    -- PRIORITY COUNTS
    -- =================================

    ISNULL(SUM(
        CASE
            WHEN LOWER(t.priority) = 'critical'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN LOWER(t.priority) = 'high'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN LOWER(t.priority) = 'medium'
            THEN 1
            ELSE 0
        END
    ), 0),

    ISNULL(SUM(
        CASE
            WHEN LOWER(t.priority) = 'low'
            THEN 1
            ELSE 0
        END
    ), 0)

FROM tickets t

WHERE 1 = 1
`

	statsArgs := []interface{}{}

	statsIndex := 1

	if strings.ToLower(role) != "superadmin" {

		statsQuery += fmt.Sprintf(`
		AND
		(
			t.createdby = @p%d
			OR
			t.assigned_to = @p%d
		)
		`,
			statsIndex,
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			userID,
		)

		statsIndex++
	}

	if status != "" {

		statsQuery += fmt.Sprintf(
			" AND t.status = @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			status,
		)

		statsIndex++
	}

	if ticketType != "" {

		statsQuery += fmt.Sprintf(
			" AND t.ticket_type = @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			ticketType,
		)

		statsIndex++
	}

	if priority != "" {

		statsQuery += fmt.Sprintf(
			" AND t.priority = @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			priority,
		)

		statsIndex++
	}

	if ticketID > 0 {

		statsQuery += fmt.Sprintf(
			" AND t.ticket_id = @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			ticketID,
		)

		statsIndex++
	}

	if customerName != "" {

		statsQuery += fmt.Sprintf(
			" AND t.customer_name LIKE @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			"%"+customerName+"%",
		)

		statsIndex++
	}

	if projectName != "" {

		statsQuery += fmt.Sprintf(
			" AND t.project_name LIKE @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			"%"+projectName+"%",
		)

		statsIndex++
	}

	if companyName != "" {

		statsQuery += fmt.Sprintf(
			" AND t.company_name LIKE @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			"%"+companyName+"%",
		)

		statsIndex++
	}

	if assignedTo > 0 {

		statsQuery += fmt.Sprintf(
			" AND t.assigned_to = @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			assignedTo,
		)

		statsIndex++
	}

	if fromDate != "" {

		statsQuery += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) >= @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			fromDate,
		)

		statsIndex++
	}

	if toDate != "" {

		statsQuery += fmt.Sprintf(
			" AND CAST(t.created_at AS DATE) <= @p%d",
			statsIndex,
		)

		statsArgs = append(
			statsArgs,
			toDate,
		)

		statsIndex++
	}

	var stats models.TicketStats

	err = db.QueryRow(
		statsQuery,
		statsArgs...,
	).Scan(
		&stats.TotalItems,
		&stats.OpenCount,
		&stats.ClosedCount,
		&stats.OnHoldCount,
		&stats.InProgressCount,
		&stats.CriticalCount,
		&stats.HighCount,
		&stats.MediumCount,
		&stats.LowCount,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get ticket stats: %w",
				err,
			)
	}

	return &models.TicketListResponse{

		Tickets: tickets,

		Pagination: models.Pagination{

			Page: page,

			PageSize: pageSize,

			TotalItems: totalItems,

			TotalPages: totalPages,
		},

		Stats: stats,
	}, nil
}

// UpdateTicket updates an existing ticket
func (s *TicketService) UpdateTicket(
	db *sql.DB,
	ticketID int64,
	req *models.TicketUpdate,
	updatedBy int,
) (*models.Ticket, error) {

	existing, err := s.GetTicketByID(
		db,
		ticketID,
	)

	if err != nil {
		return nil, err
	}

	// =====================================
	// MERGE FIELDS
	// =====================================

	title := existing.Title

	if req.Title != nil {
		title = *req.Title
	}

	customerName := existing.CustomerName

	if req.CustomerName != nil {
		customerName = req.CustomerName
	}

	employeeName := existing.EmployeeName

	if req.EmployeeName != nil {
		employeeName = req.EmployeeName
	}

	projectName := existing.ProjectName

	if req.ProjectName != nil {
		projectName = req.ProjectName
	}

	projectID := existing.ProjectID

	if req.ProjectID != nil {
		projectID = req.ProjectID
	}

	assignedTo := existing.AssignedTo

	if req.AssignedTo != nil {
		assignedTo = req.AssignedTo
	}

	ticketType := existing.TicketType

	if req.TicketType != nil {
		ticketType = *req.TicketType
	}

	priority := existing.Priority

	if req.Priority != nil {
		priority = *req.Priority
	}

	description := existing.Description

	if req.Description != nil {
		description = req.Description
	}

	status := existing.Status

	if req.Status != nil {
		status = *req.Status
	}

	dueDate := existing.DueDate

	if req.DueDate != nil {
		dueDate = req.DueDate
	}

	soNumber := existing.SoNumber

	if req.SoNumber != nil {
		soNumber = req.SoNumber
	}

	// =====================================
	// UPDATE TICKET
	// =====================================

	_, err = db.Exec(`

		EXEC sp_UpdateTicket

			@ticket_id = @p1,

			@title = @p2,

			@customer_name = @p3,

			@employee_name = @p4,

			@project_name = @p5,

			@project_id = @p6,

			@assigned_to = @p7,

			@ticket_type = @p8,

			@priority = @p9,

			@description = @p10,

			@status = @p11,

			@due_date = @p12,

			@so_number = @p13,

			@updated_by = @p14

	`,
		ticketID,

		title,

		customerName,

		employeeName,

		projectName,

		projectID,

		assignedTo,

		ticketType,

		priority,

		description,

		status,

		dueDate,

		soNumber,

		updatedBy,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to update ticket: %w",
				err,
			)
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Ticket{

		TicketID: ticketID,

		Title: title,

		CustomerName: customerName,

		EmployeeName: employeeName,

		ProjectName: projectName,

		ProjectID: projectID,

		AssignedTo: assignedTo,

		TicketType: ticketType,

		Priority: priority,

		Description: description,

		Status: status,

		DueDate: dueDate,

		SoNumber: soNumber,

		CreatedAt: existing.CreatedAt,

		UpdatedAt: time.Now().UTC(),

		TraceID: existing.TraceID,

		CreatedBy: existing.CreatedBy,

		UpdatedBy: &updatedBy,
	}, nil
}

// DeleteTicket deletes a ticket
func (s *TicketService) DeleteTicket(db *sql.DB, ticketID int64, isSoftDelete bool) error {
	var err error
	if isSoftDelete {
		_, err = db.Exec("EXEC sp_DeleteTicket @ticket_id = ?", ticketID)
	} else {
		_, err = db.Exec("DELETE FROM tickets WHERE ticket_id = ?", ticketID)
	}

	if err != nil {
		return fmt.Errorf("failed to delete ticket: %w", err)
	}

	return nil
}

// AddComment adds a comment to a ticket
func (s *TicketService) AddComment(
	db *sql.DB,
	ticketID int64,
	comment *models.CommentCreate,
	createdBy int,
) (*models.Comment, error) {

	// =====================================
	// OUTPUT VARIABLES
	// =====================================

	var (
		commentID int64
		traceID   string
	)

	// =====================================
	// EXECUTE STORED PROCEDURE
	// =====================================

	err := db.QueryRow(`
		EXEC sp_AddComment
			@ticket_id = @p1,
			@user_name = @p2,
			@message = @p3,
			@created_by = @p4
	`,
		ticketID,
		comment.UserName,
		comment.Message,
		createdBy,
	).Scan(
		&commentID,
		&traceID,
	)

	// =====================================
	// SAVE COMMENT ATTACHMENTS
	// =====================================

	for _, attachment := range comment.Attachments {

		if attachment.Base64Data != nil {

			_, err :=
				s.AddCommentAttachmentFromBase64(
					db,
					commentID,
					*attachment.Base64Data,
					*attachment.FileName,
					*attachment.FileType,
					createdBy,
				)

			if err != nil {

				return nil,
					fmt.Errorf(
						"failed to save comment attachment: %w",
						err,
					)
			}
		}
	}

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to add comment: %w",
				err,
			)
	}

	// =====================================
	// GET TICKET TITLE
	// =====================================

	var ticketTitle string

	err = db.QueryRow(`
	SELECT title
	FROM tickets
	WHERE ticket_id = @p1
`,
		ticketID,
	).Scan(
		&ticketTitle,
	)

	if err != nil {

		fmt.Println(
			"FAILED TO GET TICKET TITLE:",
			err,
		)

		ticketTitle = "Ticket"
	}

	// =====================================
	// GET TICKET CREATOR EMAIL
	// =====================================

	var creatorEmail string

	err = db.QueryRow(`
		SELECT u.email
		FROM tickets t
		INNER JOIN UserMaster u
			ON u.user_id = t.createdby
		WHERE t.ticket_id = @p1
	`,
		ticketID,
	).Scan(
		&creatorEmail,
	)

	if err != nil {

		fmt.Println(
			"FAILED TO GET TICKET CREATOR EMAIL:",
			err,
		)

	} else {

		// =================================
		// SEND EMAIL ASYNC
		// =================================

		emailService :=
			NewEmailService()

		go func() {

			err :=
				emailService.SendCommentNotificationEmail(
					creatorEmail,
					ticketID,
					ticketTitle,
					comment.UserName,
					comment.Message,
				)

			if err != nil {

				fmt.Println(
					"COMMENT EMAIL ERROR:",
					err,
				)
			}

		}()
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Comment{

		CommentID: commentID,

		TicketID: ticketID,

		UserName: comment.UserName,

		Message: comment.Message,

		CreatedAt: time.Now().UTC(),

		TraceID: traceID,

		CreatedBy: &createdBy,
	}, nil
}

// UpdateComment updates a comment
func (s *TicketService) UpdateComment(db *sql.DB, commentID int64, comment *models.CommentCreate, updatedBy int) (*models.Comment, error) {
	_, err := db.Exec(`
		EXEC sp_UpdateComment
			@comment_id = ?,
			@user_name = ?,
			@message = ?,
			@updated_by = ?
	`, commentID, comment.UserName, comment.Message, updatedBy)

	if err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}

	return &models.Comment{
		CommentID: commentID,
		UserName:  comment.UserName,
		Message:   comment.Message,
		UpdatedBy: &updatedBy,
	}, nil
}

// DeleteComment deletes a comment
func (s *TicketService) DeleteComment(
	db *sql.DB,
	commentID int64,
) error {

	result, err :=
		db.Exec(
			`
			EXEC sp_DeleteComment
				@comment_id = @p1
			`,
			commentID,
		)

	if err != nil {

		return fmt.Errorf(
			"failed to delete comment: %w",
			err,
		)
	}

	rowsAffected, err :=
		result.RowsAffected()

	if err != nil {

		return fmt.Errorf(
			"failed to get rows affected: %w",
			err,
		)
	}

	if rowsAffected == 0 {

		return errors.New(
			"comment not found",
		)
	}

	return nil
}

// AddAttachment adds an attachment to a ticket or comment
func (s *TicketService) AddAttachment(db *sql.DB, ticketID, commentID *int64, url string, createdBy int) (*models.Attachment, error) {
	var attachmentID int64
	var traceID string

	if commentID != nil && *commentID > 0 {
		// Add to comment
		var attachmentIDOut sql.NullInt64
		var traceIDOut sql.NullString
		err := db.QueryRow(`
			EXEC sp_AddCommentAttachment
				@comment_id = ?,
				@url = ?,
				@created_by = ?,
				@attachment_id = @attachment_id OUTPUT,
				@traceid = @traceid OUTPUT
		`, *commentID, url, createdBy, &attachmentIDOut, &traceIDOut).Scan(&attachmentID, &traceID)
		if err != nil {
			return nil, fmt.Errorf("failed to add comment attachment: %w", err)
		}

		return &models.Attachment{
			AttachmentID: attachmentID,
			URL:          url,
			CreatedAt:    time.Now().UTC(),
			CommentID:    commentID,
		}, nil
	}

	// Add to ticket
	var attachmentIDOut sql.NullInt64
	var traceIDOut sql.NullString
	err := db.QueryRow(`
		EXEC sp_AddTicketAttachment
			@ticket_id = ?,
			@url = ?,
			@created_by = ?,
			@attachment_id = @attachment_id OUTPUT,
			@traceid = @traceid OUTPUT
	`, *ticketID, url, createdBy, &attachmentIDOut, &traceIDOut).Scan(&attachmentID, &traceID)

	if err != nil {
		return nil, fmt.Errorf("failed to add ticket attachment: %w", err)
	}

	return &models.Attachment{
		AttachmentID: attachmentID,
		TicketID:     ticketID,
		URL:          url,
		CreatedAt:    time.Now().UTC(),
	}, nil
}

// AddAttachmentFromFile adds an attachment from a file upload
func (s *TicketService) AddAttachmentFromFile(
	db *sql.DB,
	ticketID int64,
	file *multipart.FileHeader,
	createdBy int,
) (*models.Attachment, error) {

	// =====================================
	// CREATE UPLOAD DIRECTORY
	// =====================================

	uploadsDir := "/var/www/ticket-api/uploads"

	if err := os.MkdirAll(
		uploadsDir,
		0755,
	); err != nil {

		return nil,
			fmt.Errorf(
				"failed to create uploads directory: %w",
				err,
			)
	}

	// =====================================
	// OPEN UPLOADED FILE
	// =====================================

	src, err := file.Open()

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to open uploaded file: %w",
				err,
			)
	}

	defer src.Close()

	// =====================================
	// SAFE FILE NAME
	// =====================================

	ext := filepath.Ext(
		file.Filename,
	)

	safeFileName := fmt.Sprintf(
		"%d%s",
		time.Now().UnixNano(),
		ext,
	)

	safeFileName = strings.ReplaceAll(
		safeFileName,
		" ",
		"_",
	)

	// =====================================
	// FILE SAVE PATH
	// =====================================

	filePath := filepath.Join(
		uploadsDir,
		safeFileName,
	)

	// =====================================
	// CREATE DESTINATION FILE
	// =====================================

	dst, err := os.Create(
		filePath,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to create file on disk: %w",
				err,
			)
	}

	defer dst.Close()

	// =====================================
	// COPY FILE CONTENT
	// =====================================

	if _, err := io.Copy(
		dst,
		src,
	); err != nil {

		return nil,
			fmt.Errorf(
				"failed to save file: %w",
				err,
			)
	}

	// =====================================
	// FULL URL
	// =====================================

	fullURL := fmt.Sprintf(
		"http://164.52.217.188:8082/uploads/%s",
		safeFileName,
	)

	// =====================================
	// SAVE IN DATABASE
	// =====================================

	var (
		attachmentID int64
		traceID      string
	)

	err = db.QueryRow(`
		DECLARE @attachment_id INT;
		DECLARE @traceid UNIQUEIDENTIFIER;

		EXEC sp_AddTicketAttachment
			@ticket_id = @p1,
			@url = @p2,
			@created_by = @p3,
			@attachment_id = @attachment_id OUTPUT,
			@traceid = @traceid OUTPUT;

		SELECT
			@attachment_id,
			CAST(@traceid AS VARCHAR(100));
	`,
		ticketID,
		fullURL,
		createdBy,
	).Scan(
		&attachmentID,
		&traceID,
	)

	if err != nil {

		// DELETE FILE IF DB FAILS

		os.Remove(filePath)

		return nil,
			fmt.Errorf(
				"failed to add ticket attachment: %w",
				err,
			)
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Attachment{

		AttachmentID: attachmentID,

		TicketID: &ticketID,

		URL: fullURL,

		CreatedAt: time.Now().UTC(),
	}, nil
}

// AddAttachmentFromBase64 adds an attachment from base64 data
func (s *TicketService) AddAttachmentFromBase64(
	db *sql.DB,
	ticketID int64,
	base64Data string,
	fileName string,
	fileType string,
	createdBy int,
) (*models.Attachment, error) {

	// =====================================
	// SAVE IN DATABASE
	// =====================================

	var (
		attachmentID int64
		traceID      string
	)

	err := db.QueryRow(`
		DECLARE @attachment_id INT;
		DECLARE @traceid UNIQUEIDENTIFIER;

		EXEC sp_AddTicketAttachmentBase64
			@ticket_id = @p1,
			@base64_data = @p2,
			@file_name = @p3,
			@file_type = @p4,
			@created_by = @p5,
			@attachment_id = @attachment_id OUTPUT,
			@traceid = @traceid OUTPUT;

		SELECT
			@attachment_id,
			CAST(@traceid AS VARCHAR(100));
	`,
		ticketID,
		base64Data,
		fileName,
		fileType,
		createdBy,
	).Scan(
		&attachmentID,
		&traceID,
	)

	if err != nil {
		return nil,
			fmt.Errorf(
				"failed to add ticket attachment: %w",
				err,
			)
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Attachment{

		AttachmentID: attachmentID,

		TicketID: &ticketID,

		Base64Data: &base64Data,

		FileName: &fileName,

		FileType: &fileType,

		CreatedAt: time.Now().UTC(),
	}, nil
}

func (s *TicketService) AddCommentAttachmentFromBase64(
	db *sql.DB,
	commentID int64,
	base64Data string,
	fileName string,
	fileType string,
	createdBy int,
) (*models.Attachment, error) {

	// =====================================
	// OUTPUT VARIABLES
	// =====================================

	var (
		attachmentID int64
		traceID      string
	)

	// =====================================
	// EXECUTE STORED PROCEDURE
	// =====================================

	err := db.QueryRow(`

		DECLARE @attachment_id INT;
		DECLARE @traceid UNIQUEIDENTIFIER;

		EXEC sp_AddCommentAttachment
			@comment_id = @p1,
			@url = @p2,
			@base64_data = @p3,
			@file_name = @p4,
			@file_type = @p5,
			@created_by = @p6,
			@attachment_id = @attachment_id OUTPUT,
			@traceid = @traceid OUTPUT;

		SELECT
			@attachment_id,
			CAST(@traceid AS VARCHAR(100));

	`,
		commentID,
		"", // url empty for base64 storage
		base64Data,
		fileName,
		fileType,
		createdBy,
	).Scan(
		&attachmentID,
		&traceID,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to add comment attachment: %w",
				err,
			)
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.Attachment{

		AttachmentID: attachmentID,

		CommentID: &commentID,

		Base64Data: &base64Data,

		FileName: &fileName,

		FileType: &fileType,

		CreatedAt: time.Now().UTC(),
	}, nil
}

// DeleteAttachment deletes an attachment
func (s *TicketService) DeleteAttachment(db *sql.DB, attachmentID int64, isCommentAttachment bool) error {
	var err error
	if isCommentAttachment {
		_, err = db.Exec("EXEC sp_DeleteCommentAttachment @attachment_id = ?", attachmentID)
	} else {
		_, err = db.Exec("EXEC sp_DeleteAttachment @attachment_id = ?", attachmentID)
	}

	if err != nil {
		return fmt.Errorf("failed to delete attachment: %w", err)
	}

	return nil
}

func (s *TicketService) GetComments(
	db *sql.DB,
	ticketID int64,
) ([]models.Comment, error) {

	rows, err := db.Query(`

		SELECT
			c.comment_id,
			c.ticket_id,
			c.user_name,
			c.message,
			c.created_at,
			c.traceid,
			c.createdby,
			c.updatedby

		FROM comments c

		WHERE c.ticket_id = @p1

		ORDER BY c.created_at ASC

	`, ticketID)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to query comments: %w",
				err,
			)
	}

	defer rows.Close()

	var comments []models.Comment

	for rows.Next() {

		var comment models.Comment

		err := rows.Scan(

			&comment.CommentID,

			&comment.TicketID,

			&comment.UserName,

			&comment.Message,

			&comment.CreatedAt,

			&comment.TraceID,

			&comment.CreatedBy,

			&comment.UpdatedBy,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan comment: %w",
					err,
				)
		}

		// =====================================
		// GET COMMENT ATTACHMENTS
		// =====================================

		attachments, err :=
			s.GetAttachments(

				db,

				nil,

				&comment.CommentID,

				true,
			)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to get comment attachments: %w",
					err,
				)
		}

		comment.Attachments =
			attachments

		comments = append(
			comments,
			comment,
		)
	}

	return comments, nil
}

// GetAttachments retrieves attachments for a ticket or comment
func (s *TicketService) GetAttachments(db *sql.DB, ticketID, commentID *int64, isCommentAttachment bool) ([]models.Attachment, error) {
	var rows *sql.Rows
	var err error

	if isCommentAttachment && commentID != nil {
		rows, err = db.Query(`
			SELECT
    a.attachment_id,
    a.comment_id,
    a.url,
    a.base64_data,
    a.file_name,
    a.file_type,
    a.created_at
FROM commentattachments a
WHERE a.comment_id = @p1
		`, *commentID)
	} else if ticketID != nil && *ticketID != 0 {
		rows, err = db.Query(`
			SELECT
				a.attachment_id, a.ticket_id, a.url, a.created_at
			FROM attachments a
			WHERE a.ticket_id =  @p1
		`, *ticketID)
	} else {
		return []models.Attachment{}, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to query attachments: %w", err)
	}
	defer rows.Close()

	var attachments []models.Attachment
	for rows.Next() {
		var attachment models.Attachment
		var base64Data sql.NullString
		var fileName sql.NullString
		var fileType sql.NullString
		if isCommentAttachment {
			err := rows.Scan(
				&attachment.AttachmentID,
				&attachment.CommentID,
				&attachment.URL,
				&base64Data,
				&fileName,
				&fileType,
				&attachment.CreatedAt,
			)

			if err != nil {
				return nil, fmt.Errorf("failed to scan attachment: %w", err)
			}
		} else {
			err := rows.Scan(
				&attachment.AttachmentID,
				&attachment.TicketID,
				&attachment.URL,
				&attachment.CreatedAt,
			)

			if err != nil {
				return nil, fmt.Errorf("failed to scan attachment: %w", err)
			}
		}

		if base64Data.Valid {
			attachment.Base64Data = &base64Data.String
		}

		if fileName.Valid {
			attachment.FileName = &fileName.String
		}

		if fileType.Valid {
			attachment.FileType = &fileType.String
		}
		attachments = append(attachments, attachment)
	}

	return attachments, nil
}

func (s *TicketService) GetSLAMetrics(
	db *sql.DB,
) (*models.SLAMetrics, error) {

	row := db.QueryRow(`

		EXEC sp_GetSLAMetrics

	`)

	var metrics models.SLAMetrics

	err := row.Scan(

		&metrics.AvgFirstResponseHours,

		&metrics.AvgResolutionHours,

		&metrics.SLACompliance,

		&metrics.NoDueDateCount,

		&metrics.OverdueCount,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get SLA metrics: %w",
				err,
			)
	}

	return &metrics, nil
}
