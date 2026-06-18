package services

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"ticket-management-system/config"
	"ticket-management-system/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token has expired")
	ErrInvalidResetToken  = errors.New("invalid or expired reset token")
)

type AuthService struct {
	cfg *config.JWTConfig
}

func NewAuthService(cfg *config.JWTConfig) *AuthService {
	return &AuthService{
		cfg: cfg,
	}
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(db *sql.DB, email, password string) (*models.TokenResponse, error) {
	// Get user by email
	var user models.User
	err := db.QueryRow(`
		SELECT user_id, name, company_name, emp_id, email, password, designation, report_to, traceid, role
		FROM usermaster
		WHERE email = @email
	`, sql.Named("email", email)).Scan(
		&user.UserID,
		&user.Name,
		&user.CompanyName,
		&user.EmpID,
		&user.Email,
		&user.Password,
		&user.Designation,
		&user.ReportTo,
		&user.TraceID,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, ErrInvalidCredentials
	} else if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := s.generateToken(user.UserID, user.Email, user.CompanyName, user.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.TokenResponse{
		Token:     token,
		ExpiresIn: s.cfg.ExpiresIn,
		User: models.UserResponse{
			UserID:      user.UserID,
			Name:        user.Name,
			Email:       user.Email,
			Designation: user.Designation,
			CompanyName: user.CompanyName,
			TraceID:     user.TraceID,
			Role:        user.Role,
		},
	}, nil
}

// Register creates a new user account
func (s *AuthService) Register(
	db *sql.DB,
	userData *models.UserRegister,
) (*models.UserResponse, error) {

	// =====================================
	// CHECK USER EXISTS
	// =====================================

	var count int

	err := db.QueryRow(

		"SELECT COUNT(*) FROM usermaster WHERE email = @email",

		sql.Named(
			"email",
			userData.Email,
		),
	).Scan(
		&count,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to check user existence: %w",
				err,
			)
	}

	if count > 0 {

		return nil,
			errors.New(
				"user with this email already exists",
			)
	}

	// =====================================
	// STORE PLAIN PASSWORD
	// =====================================

	plainPassword :=
		userData.Password

	// =====================================
	// HASH PASSWORD
	// =====================================

	hashedPassword,
		err := bcrypt.GenerateFromPassword(

		[]byte(
			userData.Password,
		),

		bcrypt.DefaultCost,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to hash password: %w",
				err,
			)
	}

	// =====================================
	// GENERATE TRACE ID
	// =====================================

	traceID :=
		uuid.New().String()

	// =====================================
	// INSERT USER
	// =====================================

	query := `

		INSERT INTO usermaster
		(
			name,

			company_name,

			company_mail,

			emp_id,

			email,

			password,

			designation,

			report_to,

			CreatedBy,

			updatedBY,

			traceid
		)

		VALUES
		(
			@name,

			@company_name,

			@company_mail,

			@emp_id,

			@email,

			@password,

			@designation,

			@report_to,

			@created_by,

			@updated_by,

			@traceid
		);

		SELECT
			CAST(
				SCOPE_IDENTITY()
				as int
			),
			traceid

		FROM usermaster

		WHERE email = @searchEmail;
	`

	var reportToValue interface{}

	if userData.ReportTo != nil {

		reportToValue =
			*userData.ReportTo

	} else {

		reportToValue = nil
	}

	args := []interface{}{

		sql.Named(
			"name",
			userData.Name,
		),

		sql.Named(
			"company_name",
			userData.CompanyName,
		),

		sql.Named(
			"company_mail",
			userData.CompanyMail,
		),

		sql.Named(
			"emp_id",
			userData.EmpID,
		),

		sql.Named(
			"email",
			userData.Email,
		),

		sql.Named(
			"password",
			string(
				hashedPassword,
			),
		),

		sql.Named(
			"designation",
			userData.Designation,
		),

		sql.Named(
			"report_to",
			reportToValue,
		),

		sql.Named(
			"created_by",
			nil,
		),

		sql.Named(
			"updated_by",
			nil,
		),

		sql.Named(
			"traceid",
			traceID,
		),

		sql.Named(
			"searchEmail",
			userData.Email,
		),
	}

	var userID int

	row :=
		db.QueryRow(
			query,
			args...,
		)

	err = row.Scan(
		&userID,
		&traceID,
	)

	if err != nil {

		return nil,
			fmt.Errorf(
				"failed to create user: %w",
				err,
			)
	}

	// =====================================
	// SEND WELCOME EMAIL
	// =====================================

	emailService :=
		NewEmailService()

	go func() {

		err :=
			emailService.SendWelcomeEmail(

				userData.Email,

				userData.Name,

				plainPassword,
			)

		if err != nil {

			fmt.Println(
				"WELCOME EMAIL ERROR:",
				err,
			)
		}

	}()

	// =====================================
	// RETURN RESPONSE
	// =====================================

	return &models.UserResponse{

		UserID: userID,

		Name: userData.Name,

		Email: userData.Email,

		Designation: userData.Designation,

		CompanyName: userData.CompanyName,

		TraceID: traceID,
	}, nil
}

// GetProfile retrieves user profile by ID
func (s *AuthService) GetProfile(db *sql.DB, userID int) (*models.UserResponse, error) {
	var user models.User
	err := db.QueryRow(`
		SELECT user_id, name, company_name, emp_id, email, designation, report_to, traceid
		FROM usermaster
		WHERE user_id = @userID
	`, sql.Named("userID", userID)).Scan(
		&user.UserID,
		&user.Name,
		&user.CompanyName,
		&user.EmpID,
		&user.Email,
		&user.Designation,
		&user.ReportTo,
		&user.TraceID,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	return &models.UserResponse{
		UserID:      user.UserID,
		Name:        user.Name,
		Email:       user.Email,
		Designation: user.Designation,
		CompanyName: user.CompanyName,
		TraceID:     user.TraceID,
	}, nil
}

// RefreshToken generates a new JWT token from a refresh token
func (s *AuthService) RefreshToken(db *sql.DB, tokenString string) (*models.TokenResponse, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.SecretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	userID, ok := claims["userId"].(float64)
	if !ok {
		return nil, ErrInvalidToken
	}

	// Get user details
	var user models.User
	err = db.QueryRow(`
		SELECT user_id, name, company_name, emp_id, email, designation, report_to, traceid
		FROM usermaster
		WHERE user_id = @userId
	`, sql.Named("userId", userID)).Scan(
		&user.UserID,
		&user.Name,
		&user.CompanyName,
		&user.EmpID,
		&user.Email,
		&user.Designation,
		&user.ReportTo,
		&user.TraceID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details: %w", err)
	}

	// Generate new access token
	newToken, err := s.generateToken(user.UserID, user.Email, user.CompanyName, user.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate new token: %w", err)
	}

	return &models.TokenResponse{
		Token:     newToken,
		ExpiresIn: 14400,
		User: models.UserResponse{
			UserID:      user.UserID,
			Name:        user.Name,
			Email:       user.Email,
			Designation: user.Designation,
			CompanyName: user.CompanyName,
			TraceID:     user.TraceID,
		},
	}, nil
}

// generateToken creates a new JWT token
func (s *AuthService) generateToken(userID int, email string, companyName string, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId":      userID,
		"email":       email,
		"companyName": companyName,
		"role":        role,
		"exp":         time.Now().Add(time.Duration(s.cfg.ExpiresIn) * time.Second).Unix(),
		"iat":         time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.cfg.SecretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (s *AuthService) ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.SecretKey), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	// Check expiration
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return nil, ErrTokenExpired
		}
	}

	return claims, nil
}

// ExtractUserID extracts the user ID from a validated token
func (s *AuthService) ExtractUserID(tokenString string) (int, error) {
	claims, err := s.ValidateToken(tokenString)
	if err != nil {
		return 0, err
	}

	userID, ok := claims["userId"].(float64)
	if !ok {
		return 0, ErrInvalidToken
	}

	return int(userID), nil
}

// ForgotPassword sends reset password email
func (s *AuthService) ForgotPassword(

	db *sql.DB,

	email string,

) error {

	var count int

	err := db.QueryRow(`
		SELECT COUNT(*)
		FROM usermaster
		WHERE email = @p1
	`,
		email,
	).Scan(&count)

	if err != nil {

		return fmt.Errorf(
			"failed to check email: %w",
			err,
		)
	}

	if count == 0 {

		return errors.New(
			"user with this email does not exist",
		)
	}

	resetToken :=
		uuid.New().String()

	_, err = db.Exec(`

	EXEC sp_SetResetToken

		@email = @p1,

		@reset_token = @p2

`,
		email,
		resetToken,
	)

	if err != nil {

		return fmt.Errorf(
			"failed to save reset token: %w",
			err,
		)
	}

	resetURL := fmt.Sprintf(
		"http://164.52.217.188:8082/reset-password?token=%s",
		resetToken,
	)

	emailService :=
		NewEmailService()

	go func() {

		err :=
			emailService.SendForgotPasswordEmail(
				email,
				resetURL,
			)

		if err != nil {

			fmt.Println(
				"FORGOT PASSWORD EMAIL ERROR:",
				err,
			)
		}

	}()

	return nil
}

// ResetPassword updates user password
func (s *AuthService) ResetPassword(

	db *sql.DB,

	token string,

	newPassword string,

) error {

	// =====================================
	// HASH PASSWORD
	// =====================================

	hashedPassword,
		err := bcrypt.GenerateFromPassword(

		[]byte(newPassword),

		bcrypt.DefaultCost,
	)

	if err != nil {

		return fmt.Errorf(
			"failed to hash password: %w",
			err,
		)
	}

	// =====================================
	// EXECUTE SP
	// =====================================

	_, err = db.Exec(

		`
		EXEC sp_ResetPassword

			@reset_token = @p1,

			@new_password = @p2
		`,

		token,

		string(hashedPassword),
	)

	if err != nil {

		return fmt.Errorf(
			"failed to reset password: %w",
			err,
		)
	}

	return nil
}
