package main

import (
	"log"
	"net/http"

	"pittsix/internal/articles"
	"pittsix/internal/auth"
	"pittsix/internal/db"
	"pittsix/internal/upload"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mongoClient := db.ConnectMongo()
	psql := db.InitPostgres()
	defer psql.Close()

	articleCollection := mongoClient.Database("pittsix").Collection("articles")
	articles.Init(articleCollection)

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	mux.HandleFunc("/auth/login", auth.LoginHandler)
	mux.HandleFunc("/auth/register", auth.RegisterHandler)

	// Artículos
	articles.RegisterHandlers(mux)

	upload.RegisterHandlers(mux)

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	}).Handler(mux)

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
