package handlers

import (
	"net/http"
	"ticket-management-system/database"
	"ticket-management-system/models"
	"ticket-management-system/services"

	"github.com/gin-gonic/gin"
)

type CompanyHandler struct {
	companyService *services.CompanyService
}

func NewCompanyHandler(
	companyService *services.CompanyService,
) *CompanyHandler {

	return &CompanyHandler{
		companyService: companyService,
	}
}

// / GetCompanies handles fetching all companies
// @Summary Get all companies
// @Description Get distinct company names from users
// @Tags companies
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.SuccessResponse{data=[]models.Company}
// @Failure 500 {object} models.ErrorResponse
// @Router /api/companies [get]
func (h *CompanyHandler) GetCompanies(
	c *gin.Context,
) {

	companies, err :=
		h.companyService.GetCompanies(
			database.DB,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			models.ErrorResponse{
				Success: false,
				Error: models.Error{
					Code: "GET_COMPANIES_FAILED",

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

			Data: companies,
		},
	)
}
