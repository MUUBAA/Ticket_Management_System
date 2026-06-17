package services

import (
	"database/sql"
	"fmt"
	"ticket-management-system/models"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) GetUsers(
	db *sql.DB,
	page int,
	pageSize int,
	search string,
	companyName string,
) (*models.UserListResponse, error) {

	// =====================================
	// EXECUTE STORED PROCEDURE
	// =====================================

	rows, err := db.Query(`
		EXEC sp_GetUsers
			@p1,
			@p2,
			@p3,
			@p4
	`,
		page,
		pageSize,
		search,
		companyName,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get users: %w",
				err,
			)
	}

	defer rows.Close()

	// =====================================
	// USERS LIST
	// =====================================

	var users []models.UserMaster

	for rows.Next() {

		var user models.UserMaster

		var (
			companyNameDB sql.NullString

			empID sql.NullString

			designation sql.NullString

			reportTo sql.NullInt64

			reportToName sql.NullString

			createdBy sql.NullInt64

			updatedBy sql.NullInt64
		)

		// =================================
		// SCAN USER
		// =================================

		err := rows.Scan(

			&user.UserID,

			&user.Name,

			&companyNameDB,

			&empID,

			&user.Email,

			&designation,

			&reportTo,

			&reportToName,

			&createdBy,

			&user.CreatedOn,

			&updatedBy,

			&user.UpdatedOn,

			&user.TraceID,

			&user.TotalTickets,

			&user.OpenCount,

			&user.InProgressCount,

			&user.OnHoldCount,

			&user.ClosedCount,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan user: %w",
					err,
				)
		}

		// =================================
		// NULL HANDLING
		// =================================

		if companyNameDB.Valid {

			user.CompanyName =
				&companyNameDB.String
		}

		if empID.Valid {

			user.EmpID =
				&empID.String
		}

		if designation.Valid {

			user.Designation =
				&designation.String
		}

		if reportTo.Valid {

			id :=
				int(reportTo.Int64)

			user.ReportTo =
				&id
		}

		if reportToName.Valid {

			user.ReportToName =
				&reportToName.String
		}

		if createdBy.Valid {

			id :=
				int(createdBy.Int64)

			user.CreatedBy =
				&id
		}

		if updatedBy.Valid {

			id :=
				int(updatedBy.Int64)

			user.UpdatedBy =
				&id
		}

		users = append(
			users,
			user,
		)
	}

	// =====================================
	// CHECK ROW ERRORS
	// =====================================

	if err := rows.Err(); err != nil {

		return nil,
			fmt.Errorf(
				"rows iteration error: %w",
				err,
			)
	}

	// =====================================
	// MOVE TO TOTAL COUNT RESULT SET
	// =====================================

	if !rows.NextResultSet() {

		return nil,
			fmt.Errorf(
				"failed to move to total count result set",
			)
	}

	// =====================================
	// TOTAL ITEMS
	// =====================================

	var totalItems int

	if rows.Next() {

		err := rows.Scan(
			&totalItems,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan total count: %w",
					err,
				)
		}
	}

	// =====================================
	// TOTAL PAGES
	// =====================================

	totalPages := 0

	if totalItems > 0 {

		totalPages =
			(totalItems + pageSize - 1) /
				pageSize
	}

	// =====================================
	// RESPONSE
	// =====================================

	return &models.UserListResponse{

		Users: users,

		Pagination: models.Pagination{

			Page: page,

			PageSize: pageSize,

			TotalItems: totalItems,

			TotalPages: totalPages,
		},
	}, nil
}

func (s *UserService) GetUserByID(
	db *sql.DB,
	userID int,
) (*models.UserMaster, error) {

	row := db.QueryRow(`
		EXEC sp_GetUserById @p1
	`,
		userID,
	)

	var user models.UserMaster

	var (
		companyName  sql.NullString
		empID        sql.NullString
		designation  sql.NullString
		reportTo     sql.NullInt64
		reportToName sql.NullString
		createdBy    sql.NullInt64
		updatedBy    sql.NullInt64
	)

	err := row.Scan(
		&user.UserID,
		&user.Name,
		&companyName,
		&empID,
		&user.Email,
		&designation,
		&reportTo,
		&reportToName,
		&createdBy,
		&user.CreatedOn,
		&updatedBy,
		&user.UpdatedOn,
		&user.TraceID,
		&user.TotalTickets,
		&user.OpenCount,
		&user.InProgressCount,
		&user.OnHoldCount,
		&user.ClosedCount,
	)

	if err != nil {

		if err == sql.ErrNoRows {

			return nil,
				fmt.Errorf(
					"user not found",
				)
		}

		return nil,
			fmt.Errorf(
				"failed to get user: %w",
				err,
			)
	}

	if companyName.Valid {
		user.CompanyName =
			&companyName.String
	}

	if empID.Valid {
		user.EmpID =
			&empID.String
	}

	if designation.Valid {
		user.Designation =
			&designation.String
	}

	if reportTo.Valid {

		id :=
			int(reportTo.Int64)

		user.ReportTo = &id
	}

	if reportToName.Valid {

		user.ReportToName =
			&reportToName.String
	}

	if createdBy.Valid {

		id :=
			int(createdBy.Int64)

		user.CreatedBy = &id
	}

	if updatedBy.Valid {

		id :=
			int(updatedBy.Int64)

		user.UpdatedBy = &id
	}

	return &user, nil
}

func (s *UserService) UpdateUser(
	db *sql.DB,
	userID int,
	req *models.UserUpdate,
	updatedBy int,
) (*models.UserMaster, error) {

	// =====================================
	// GET EXISTING USER
	// =====================================

	existing, err :=
		s.GetUserByID(
			db,
			userID,
		)

	if err != nil {
		return nil, err
	}

	// =====================================
	// MERGE VALUES
	// =====================================

	name := existing.Name

	if req.Name != nil {
		name = *req.Name
	}

	// =====================================
	// COMPANY NAME
	// =====================================

	companyName := ""

	if existing.CompanyName != nil {
		companyName =
			*existing.CompanyName
	}

	if req.CompanyName != nil {
		companyName =
			*req.CompanyName
	}

	// =====================================
	// EMP ID
	// =====================================

	empID := ""

	if existing.EmpID != nil {
		empID =
			*existing.EmpID
	}

	if req.EmpID != nil {
		empID =
			*req.EmpID
	}

	// =====================================
	// EMAIL
	// =====================================

	email := existing.Email

	if req.Email != nil {
		email =
			*req.Email
	}

	// =====================================
	// DESIGNATION
	// =====================================

	designation := ""

	if existing.Designation != nil {
		designation =
			*existing.Designation
	}

	if req.Designation != nil {
		designation =
			*req.Designation
	}

	// =====================================
	// REPORT TO
	// =====================================

	var reportTo interface{} = nil

	if existing.ReportTo != nil {
		reportTo =
			*existing.ReportTo
	}

	if req.ReportTo != nil {

		if *req.ReportTo > 0 {

			reportTo =
				*req.ReportTo

		} else {

			reportTo = nil
		}
	}

	// =====================================
	// EXECUTE SP
	// =====================================

	row := db.QueryRow(`
		EXEC sp_UpdateUser
			@p1,
			@p2,
			@p3,
			@p4,
			@p5,
			@p6,
			@p7,
			@p8
	`,
		userID,
		name,
		companyName,
		empID,
		email,
		designation,
		reportTo,
		updatedBy,
	)

	// =====================================
	// RESPONSE OBJECT
	// =====================================

	var updatedUser models.UserMaster

	var (
		updatedCompanyName  sql.NullString
		updatedEmpID        sql.NullString
		updatedDesignation  sql.NullString
		updatedReportTo     sql.NullInt64
		updatedReportToName sql.NullString
		createdBy           sql.NullInt64
		updatedByDB         sql.NullInt64
	)

	// =====================================
	// SCAN RESPONSE
	// =====================================

	err = row.Scan(
		&updatedUser.UserID,
		&updatedUser.Name,
		&updatedCompanyName,
		&updatedEmpID,
		&updatedUser.Email,
		&updatedDesignation,
		&updatedReportTo,
		&updatedReportToName,
		&createdBy,
		&updatedUser.CreatedOn,
		&updatedByDB,
		&updatedUser.UpdatedOn,
		&updatedUser.TraceID,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to update user: %w",
				err,
			)
	}

	// =====================================
	// MAP NULLABLE FIELDS
	// =====================================

	if updatedCompanyName.Valid {

		updatedUser.CompanyName =
			&updatedCompanyName.String
	}

	if updatedEmpID.Valid {

		updatedUser.EmpID =
			&updatedEmpID.String
	}

	if updatedDesignation.Valid {

		updatedUser.Designation =
			&updatedDesignation.String
	}

	if updatedReportTo.Valid {

		id :=
			int(updatedReportTo.Int64)

		updatedUser.ReportTo =
			&id
	}

	if updatedReportToName.Valid {

		updatedUser.ReportToName =
			&updatedReportToName.String
	}

	if createdBy.Valid {

		id :=
			int(createdBy.Int64)

		updatedUser.CreatedBy =
			&id
	}

	if updatedByDB.Valid {

		id :=
			int(updatedByDB.Int64)

		updatedUser.UpdatedBy =
			&id
	}

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &updatedUser, nil
}

func (s *UserService) GetCompanyUsers(
	db *sql.DB,
	userID int,
) ([]models.CompanyUser, error) {

	// =====================================
	// GET LOGGED-IN USER COMPANY
	// =====================================

	var companyName string

	err := db.QueryRow(`
		SELECT company_name
		FROM UserMaster
		WHERE user_id = @p1
	`,
		userID,
	).Scan(
		&companyName,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get company name: %w",
				err,
			)
	}

	// =====================================
	// GET COMPANY USERS
	// =====================================

	rows, err := db.Query(`
		SELECT

			user_id,

			name

		FROM UserMaster

		WHERE

			LTRIM(RTRIM(ISNULL(company_name, '')))
			=
			LTRIM(RTRIM(@p1))

		ORDER BY name ASC
	`,
		companyName,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to get company users: %w",
				err,
			)
	}

	defer rows.Close()

	// =====================================
	// RESPONSE
	// =====================================

	var users []models.CompanyUser

	for rows.Next() {

		var user models.CompanyUser

		err := rows.Scan(
			&user.UserID,
			&user.Name,
		)

		if err != nil {

			return nil,
				fmt.Errorf(
					"failed to scan company user: %w",
					err,
				)
		}

		users = append(
			users,
			user,
		)
	}

	return users, nil
}
