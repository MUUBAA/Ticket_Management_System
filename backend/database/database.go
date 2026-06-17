package database

import (
	"database/sql"
	"fmt"
	"log"

	"ticket-management-system/config"

	_ "github.com/microsoft/go-mssqldb"
)

var DB *sql.DB

func InitDatabase(cfg *config.DatabaseConfig) error {
	var err error
	DB, err = sql.Open("sqlserver", cfg.ConnectionString)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection established successfully")
	return nil
}

func CloseDatabase() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
