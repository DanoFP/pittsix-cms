package organizations

import (
	"encoding/json"
	"net/http"
	"strings"

	"pittsix/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Handlers struct {
	repo     Repository
	userRepo users.Repository
}

func NewHandlers(repo Repository, userRepo users.Repository) *Handlers {
	return &Handlers{repo: repo, userRepo: userRepo}
}

func (h *Handlers) ListOrganizations(w http.ResponseWriter, r *http.Request) {
	cur, err := h.repo.(*MongoRepository).collection.Find(r.Context(), primitive.M{})
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cur.Close(r.Context())
	var orgs []Organization
	for cur.Next(r.Context()) {
		var o Organization
		if err := cur.Decode(&o); err == nil {
			orgs = append(orgs, o)
		}
	}
	if err := cur.Err(); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(orgs)
}

func (h *Handlers) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var input Organization
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if input.Name == "" {
		http.Error(w, "Name required", http.StatusBadRequest)
		return
	}
	if org, _ := h.repo.GetByName(input.Name); org != nil {
		http.Error(w, "Organization already exists", http.StatusConflict)
		return
	}
	input.ID = primitive.NewObjectID()
	if err := h.repo.Create(&input); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

func (h *Handlers) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/organizations/")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid org id", http.StatusBadRequest)
		return
	}
	var update map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}
	if name, ok := update["name"].(string); ok && name != "" {
		if org, _ := h.repo.GetByName(name); org != nil && org.ID != id {
			http.Error(w, "Organization name already exists", http.StatusConflict)
			return
		}
	}
	if err := h.repo.Update(id, update); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *Handlers) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/organizations/")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid org id", http.StatusBadRequest)
		return
	}
	// Validar que no tenga usuarios activos
	usersInOrg, _ := h.userRepo.GetUsersByOrganization(id.Hex())
	if len(usersInOrg) > 0 {
		http.Error(w, "Organization has active users", http.StatusConflict)
		return
	}
	if err := h.repo.Delete(id); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func (h *Handlers) ListOrganizationUsers(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/organizations/")
	idStr = strings.TrimSuffix(idStr, "/users")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid org id", http.StatusBadRequest)
		return
	}
	users, err := h.userRepo.GetUsersByOrganization(id.Hex())
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}
