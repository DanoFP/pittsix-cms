package db

import (
    "database/sql"
    "log"

    _ "github.com/lib/pq"
)

var db *sql.DB

func MustGetPostgres() *sql.DB {
    if db == nil {
        var err error
        db, err = sql.Open("postgres", "host=localhost port=5432 user=user password=pass dbname=mydb sslmode=disable")
        if err != nil {
            log.Fatalf("Postgres connection failed: %v", err)
        }
    }
    return db
}