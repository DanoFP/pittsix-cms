package users

import (
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Handlers struct {
	Repo Repository
}

var validRoles = map[string]bool{"user": true, "org_admin": true, "superadmin": true}
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func NewHandlers(repo Repository) *Handlers {
	return &Handlers{Repo: repo}
}

func (h *Handlers) ListUsers(w http.ResponseWriter, r *http.Request) {
	// Solo superadmin (ya protegido por middleware)
	users, err := h.Repo.(*MongoRepository).Collection().Find(r.Context(), primitive.M{})
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer users.Close(r.Context())
	var usersList []User
	for users.Next(r.Context()) {
		var u User
		if err := users.Decode(&u); err == nil {
			usersList = append(usersList, u)
		}
	}
	if err := users.Err(); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(usersList)
}

func (h *Handlers) ListOrgUsers(w http.ResponseWriter, r *http.Request) {
	orgID, _ := r.Context().Value("organization_id").(string)
	users, err := h.Repo.GetUsersByOrganization(orgID)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}

func (h *Handlers) CreateUser(w http.ResponseWriter, r *http.Request) {
	// Solo org_admin o superadmin (ya protegido por middleware)
	var input User
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	// Validar email único
	existing, _ := h.Repo.GetUserByEmail(input.Email)
	if existing != nil {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}
	// Validar roles
	for _, role := range input.Roles {
		if !validRoles[role] {
			http.Error(w, "Invalid role", http.StatusBadRequest)
			return
		}
	}
	input.ID = primitive.NewObjectID()
	input.CreatedAt = time.Now().Unix()
	input.UpdatedAt = input.CreatedAt
	if err := h.Repo.CreateUser(&input); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

func (h *Handlers) UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Solo org_admin de la misma org, superadmin, o el propio usuario
	idStr := strings.TrimPrefix(r.URL.Path, "/users/")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	// Verificar existencia
	user, _ := h.Repo.GetUserByID(id)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	var update map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if err := h.Repo.UpdateUser(id, update); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *Handlers) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Solo org_admin de la misma org o superadmin
	idStr := strings.TrimPrefix(r.URL.Path, "/users/")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	// Verificar existencia
	user, _ := h.Repo.GetUserByID(id)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if err := h.Repo.DeleteUser(id); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func (h *Handlers) UpdateUserRoles(w http.ResponseWriter, r *http.Request) {
	// Solo org_admin de la misma org o superadmin
	idStr := strings.TrimPrefix(r.URL.Path, "/users/")
	idStr = strings.TrimSuffix(idStr, "/roles")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	var input struct {
		Roles       []string `json:"roles"`
		Permissions []string `json:"permissions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if err := h.Repo.UpdateUserRoles(id, input.Roles, input.Permissions); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "roles updated"})
}

func (h *Handlers) UpdateMe(w http.ResponseWriter, r *http.Request) {
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
	var update struct {
		FirstName    string `json:"first_name"`
		LastName     string `json:"last_name"`
		Bio          string `json:"bio"`
		ProfileImage string `json:"profile_image"`
	}
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	fields := map[string]interface{}{}
	if update.FirstName != "" {
		fields["first_name"] = update.FirstName
	}
	if update.LastName != "" {
		fields["last_name"] = update.LastName
	}
	if update.Bio != "" {
		fields["bio"] = update.Bio
	}
	if update.ProfileImage != "" {
		fields["profile_image"] = update.ProfileImage
	}
	if err := h.Repo.UpdateUser(userID, fields); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *Handlers) InviteUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if input.Email == "" || !emailRegex.MatchString(input.Email) {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}
	if existing, _ := h.Repo.GetUserByEmail(input.Email); existing != nil {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}
	user := &User{
		Email:        input.Email,
		Roles:        []string{"user"},
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Bio:          "",
		FirstName:    "",
		LastName:     "",
		ProfileImage: "",
	}
	// Estado pending (puedes agregar un campo Status si lo deseas)
	// user.Status = "pending"
	if err := h.Repo.CreateUser(user); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	// Generar token de invitación (stub, puedes usar JWT u otro método)
	token := "invite-token-stub-" + user.ID.Hex()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"invite_token": token})
}

func (h *Handlers) GetMe(w http.ResponseWriter, r *http.Request) {
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
	user, err := h.Repo.GetUserByID(userID)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(user)
}
