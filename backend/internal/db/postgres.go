package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

func MustGetPostgres() *sql.DB {
	if db == nil {
		var err error
		db, err = sql.Open("postgres", "host=postgres port=5432 user=postgres password=postgres dbname=pittsix sslmode=disable")
		if err != nil {
			log.Fatalf("Postgres connection failed: %v", err)
		}
	}
	return db
}

func InitPostgres() *sql.DB {
	// Conectarse a la base "postgres" para crear la base real
	adminConnStr := "host=postgres user=postgres password=postgres dbname=pittsix sslmode=disable"
	adminDB, err := sql.Open("postgres", adminConnStr)
	if err != nil {
		log.Fatalf("❌ Error conectando como admin: %v", err)
	}

	dbName := "pittsix"
	_, err = adminDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbName))
	if err != nil && !isAlreadyExists(err) {
		log.Fatalf("❌ Error creando la base %s: %v", dbName, err)
	}
	adminDB.Close()

	// Conectarse a la base real
	appConnStr := "host=postgres user=postgres password=postgres dbname=pittsix sslmode=disable"
	db, err := sql.Open("postgres", appConnStr)
	if err != nil {
		log.Fatalf("❌ Error conectando a la base %s: %v", dbName, err)
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            bio TEXT,
            profile_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		log.Fatalf("❌ Error creando tabla users: %v", err)
	}

	// Agregar columnas si no existen (para migraciones en bases ya creadas)
	columns := []struct{ name, typ string }{
		{"first_name", "TEXT"},
		{"last_name", "TEXT"},
		{"bio", "TEXT"},
		{"profile_image", "TEXT"},
		{"updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"},
	}
	for _, col := range columns {
		_, _ = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS " + col.name + " " + col.typ)
	}

	log.Println("✅ PostgreSQL inicializado correctamente")
	return db
}

func isAlreadyExists(err error) bool {
	return err != nil && err.Error() == "pq: database \"pittsix\" already exists"
}
