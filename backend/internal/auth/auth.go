package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"pittsix/internal/users"
	"pittsix/pkg/config"
	"pittsix/pkg/security"
)

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	hash := security.HashPassword(creds.Password, config.LoadConfig().Security.Pepper)
	if err := users.CreateUser(creds.Email, hash); err != nil {
		log.Println(err.Error())
		http.Error(w, "User creation failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	user, err := users.GetUserByEmail(creds.Email)
	if err != nil || !security.CheckPassword(creds.Password, user.PasswordHash, config.LoadConfig().Security.Pepper) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	token, _ := security.GenerateJWT(user.ID)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
