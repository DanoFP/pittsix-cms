package main

import (
	"log"
	"net/http"

	"pittsix/internal/articles"
	"pittsix/internal/auth"
	"pittsix/internal/bootstrap"
	"pittsix/internal/db"
	"pittsix/internal/organizations"
	"pittsix/internal/upload"
	"pittsix/internal/users"
	"pittsix/pkg/middleware"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mongoClient := db.ConnectMongo()

	userCollection := mongoClient.Database("pittsix_users").Collection("users")
	usersRepo := users.NewMongoRepository(userCollection)
	articleCollection := mongoClient.Database("pittsix_articles").Collection("articles")
	articles.Init(articleCollection, usersRepo)
	orgCollection := mongoClient.Database("pittsix_orgs").Collection("organizations")
	orgRepo := organizations.NewMongoRepository(orgCollection)
	bootstrap.InitUsersAndOrgs(usersRepo, orgRepo)

	authHandlers := auth.NewAuthHandlers(usersRepo)
	userHandlers := users.NewHandlers(usersRepo)
	orgHandlers := organizations.NewHandlers(orgRepo, usersRepo)

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	mux.HandleFunc("/auth/login", authHandlers.Login)
	mux.HandleFunc("/auth/register", authHandlers.Register)
	mux.HandleFunc("/auth/forgot-password", authHandlers.ForgotPassword)
	mux.HandleFunc("/auth/reset-password", authHandlers.ResetPassword)

	// Artículos
	articles.RegisterHandlers(mux)

	// Crear cliente real de Minio
	minioClient, err := minio.New("minio:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("minio", "minio123", ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("❌ Error conectando a MinIO: %v", err)
	}
	uploadHandler := upload.NewHandler(minioClient)
	upload.RegisterHandlers(mux, uploadHandler)

	mux.Handle("/profile", middleware.JWTAuth(http.HandlerFunc(authHandlers.Profile)))
	mux.Handle("/users", middleware.JWTAuth(middleware.RequireOrgAdminOrSuperadmin()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			userHandlers.ListUsers(w, r)
		case http.MethodPost:
			userHandlers.CreateUser(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))))
	mux.Handle("/org/users", middleware.JWTAuth(middleware.RequireOrgAdminOrSuperadmin()(http.HandlerFunc(userHandlers.ListOrgUsers))))
	mux.Handle("/users/", middleware.JWTAuth(middleware.RequireOrgAdminOrSuperadmin()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		switch {
		// Actualizar roles: PUT /users/{id}/roles
		case r.Method == http.MethodPut && len(path) > len("/users/") && path[len(path)-6:] == "/roles":
			userHandlers.UpdateUserRoles(w, r)
		// Actualizar usuario: PUT /users/{id}
		case r.Method == http.MethodPut && len(path) > len("/users/"):
			userHandlers.UpdateUser(w, r)
		// Eliminar usuario: DELETE /users/{id}
		case r.Method == http.MethodDelete && len(path) > len("/users/"):
			userHandlers.DeleteUser(w, r)
		default:
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	}))))
	mux.Handle("/users/me", middleware.JWTAuth(http.HandlerFunc(userHandlers.GetMe)))
	mux.Handle("/users/invite", middleware.JWTAuth(middleware.RequireOrgAdminOrSuperadmin()(http.HandlerFunc(userHandlers.InviteUser))))

	mux.Handle("/organizations", middleware.JWTAuth(middleware.RequireRole("superadmin")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			orgHandlers.ListOrganizations(w, r)
		case http.MethodPost:
			orgHandlers.CreateOrganization(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))))
	mux.Handle("/organizations/", middleware.JWTAuth(middleware.RequireOrgAdminOrSuperadmin()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		switch {
		// Actualizar organización: PUT /organizations/{id}
		case r.Method == http.MethodPut && len(path) > len("/organizations/"):
			orgHandlers.UpdateOrganization(w, r)
		// Eliminar organización: DELETE /organizations/{id}
		case r.Method == http.MethodDelete && len(path) > len("/organizations/"):
			orgHandlers.DeleteOrganization(w, r)
		// Listar usuarios de la organización: GET /organizations/{id}/users
		case r.Method == http.MethodGet && len(path) > len("/organizations/") && path[len(path)-6:] == "/users":
			orgHandlers.ListOrganizationUsers(w, r)
		default:
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	}))))

	mainHandler := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://frontend:80",
			"http://3.137.192.116",
			"http://pittsix.com",
			"https://pittsix.com",
			"http://www.pittsix.com",
			"https://www.pittsix.com",
		},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	}).Handler(mux)

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", mainHandler))
}
