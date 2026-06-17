package services

import (
	"database/sql"
	"ticket-management-system/models"
)

type CompanyService struct{}

func NewCompanyService() *CompanyService {
	return &CompanyService{}
}

func (s *CompanyService) GetCompanies(
	db *sql.DB,
) ([]models.Company, error) {

	rows, err := db.Query(`
		EXEC sp_GetCompanies
	`)

	if err != nil {

		return nil, err
	}

	defer rows.Close()

	var companies []models.Company

	for rows.Next() {

		var company models.Company

		err := rows.Scan(
			&company.CompanyID,
			&company.CompanyName,
		)

		if err != nil {

			return nil, err
		}

		companies = append(
			companies,
			company,
		)
	}

	if err := rows.Err(); err != nil {

		return nil, err
	}

	return companies, nil
}
