package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"pittsix/internal/users"
	"pittsix/pkg/config"
	"pittsix/pkg/security"

	"crypto/rand"
	"encoding/hex"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Handlers struct {
	repo users.Repository
}

func NewAuthHandlers(repo users.Repository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) Register(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	hash := security.HashPassword(creds.Password, config.LoadConfig().Security.Pepper)
	user := &users.User{
		Email:        creds.Email,
		PasswordHash: hash,
	}
	if err := h.repo.CreateUser(user); err != nil {
		log.Println(err.Error())
		http.Error(w, "User creation failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	user, err := h.repo.GetUserByEmail(creds.Email)
	if err != nil || !security.CheckPassword(creds.Password, user.PasswordHash, config.LoadConfig().Security.Pepper) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	token, _ := security.GenerateJWT(user.ID.Hex(), user.OrganizationID.Hex(), user.Roles, user.Permissions)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *Handlers) Profile(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		user, err := h.repo.GetUserByID(userID)
		if err != nil {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(user)
		return
	case http.MethodPut:
		var payload struct {
			FirstName    string `json:"first_name"`
			LastName     string `json:"last_name"`
			Bio          string `json:"bio"`
			ProfileImage string `json:"profile_image"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid body", http.StatusBadRequest)
			return
		}
		update := map[string]interface{}{
			"first_name":    payload.FirstName,
			"last_name":     payload.LastName,
			"bio":           payload.Bio,
			"profile_image": payload.ProfileImage,
		}
		if err := h.repo.UpdateUserProfile(userID, update); err != nil {
			http.Error(w, "Update failed", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
		return
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (h *Handlers) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	user, err := h.repo.GetUserByEmail(input.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	// Generar token seguro
	tokenBytes := make([]byte, 32)
	_, _ = rand.Read(tokenBytes)
	token := hex.EncodeToString(tokenBytes)
	user.ResetToken = token
	user.ResetTokenExpiry = time.Now().Add(30 * time.Minute).Unix()
	_ = h.repo.UpdateUser(user.ID, map[string]interface{}{"reset_token": token, "reset_token_expiry": user.ResetTokenExpiry})
	// En producción, enviar por email. Aquí lo devolvemos para test.
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"reset_token": token})
}

func (h *Handlers) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if input.Token == "" || input.NewPassword == "" {
		http.Error(w, "Token and new_password required", http.StatusBadRequest)
		return
	}
	// Buscar usuario por token
	var user *users.User
	all, _ := h.repo.(*users.MongoRepository).Collection().Find(r.Context(), map[string]interface{}{"reset_token": input.Token})
	for all.Next(r.Context()) {
		var u users.User
		_ = all.Decode(&u)
		if u.ResetToken == input.Token && u.ResetTokenExpiry > time.Now().Unix() {
			user = &u
			break
		}
	}
	if user == nil {
		http.Error(w, "Invalid or expired token", http.StatusBadRequest)
		return
	}
	hash := security.HashPassword(input.NewPassword, config.LoadConfig().Security.Pepper)
	_ = h.repo.UpdateUser(user.ID, map[string]interface{}{"password_hash": hash, "reset_token": "", "reset_token_expiry": 0})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "password reset"})
}
