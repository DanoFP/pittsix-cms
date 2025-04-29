package users_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pittsix/internal/users"
)

var testColl *mongo.Collection

func TestMain(m *testing.M) {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		panic(err)
	}
	testColl = client.Database("test_pittsix_users").Collection("users")
	testColl.Drop(context.Background())
	code := m.Run()
	testColl.Drop(context.Background())
	os.Exit(code)
}

func setupHandlers() *users.Handlers {
	repo := users.NewMongoRepository(testColl)
	return users.NewHandlers(repo)
}

func TestCreateAndListUser(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	// Crear usuario
	user := users.User{
		Email:        "testuser@example.com",
		PasswordHash: "hash",
		FirstName:    "Test",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	body, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.CreateUser(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	// Listar usuarios
	req = httptest.NewRequest(http.MethodGet, "/users", nil)
	w = httptest.NewRecorder()
	h.ListUsers(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var usersList []users.User
	if err := json.NewDecoder(w.Body).Decode(&usersList); err != nil {
		t.Fatalf("failed to decode users: %v", err)
	}
	if len(usersList) != 1 || usersList[0].Email != "testuser@example.com" {
		t.Fatalf("unexpected users: %+v", usersList)
	}
}

func TestListUsers(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "listuser@example.com",
		PasswordHash: "hash",
		FirstName:    "List",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	req := httptest.NewRequest(http.MethodGet, "/users", nil)
	w := httptest.NewRecorder()
	h.ListUsers(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var usersList []users.User
	if err := json.NewDecoder(w.Body).Decode(&usersList); err != nil {
		t.Fatalf("failed to decode users: %v", err)
	}
	if len(usersList) != 1 || usersList[0].Email != "listuser@example.com" {
		t.Fatalf("unexpected users: %+v", usersList)
	}
}

func TestListOrgUsers(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	orgID := primitive.NewObjectID()
	user := users.User{
		Email:          "orguser@example.com",
		PasswordHash:   "hash",
		FirstName:      "Org",
		LastName:       "User",
		CreatedAt:      time.Now().Unix(),
		UpdatedAt:      time.Now().Unix(),
		OrganizationID: orgID,
		Roles:          []string{"user"},
		Permissions:    []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	req := httptest.NewRequest(http.MethodGet, "/users/org", nil)
	ctx := context.WithValue(req.Context(), "organization_id", orgID.Hex())
	w := httptest.NewRecorder()
	h.ListOrgUsers(w, req.WithContext(ctx))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var usersList []users.User
	if err := json.NewDecoder(w.Body).Decode(&usersList); err != nil {
		t.Fatalf("failed to decode users: %v", err)
	}
	if len(usersList) != 1 || usersList[0].Email != "orguser@example.com" {
		t.Fatalf("unexpected users: %+v", usersList)
	}
}

func TestUpdateUser(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "updateuser@example.com",
		PasswordHash: "hash",
		FirstName:    "Update",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	update := map[string]interface{}{"first_name": "Updated"}
	body, _ := json.Marshal(update)
	req := httptest.NewRequest(http.MethodPut, "/users/"+user.ID.Hex(), bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.UpdateUser(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	updated, _ := h.Repo.GetUserByID(user.ID)
	if updated.FirstName != "Updated" {
		t.Fatalf("expected first_name Updated, got %s", updated.FirstName)
	}
}

func TestDeleteUser(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "deleteuser@example.com",
		PasswordHash: "hash",
		FirstName:    "Delete",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	req := httptest.NewRequest(http.MethodDelete, "/users/"+user.ID.Hex(), nil)
	w := httptest.NewRecorder()
	h.DeleteUser(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	_, err := h.Repo.GetUserByID(user.ID)
	if err == nil {
		t.Fatalf("expected user deleted, but found")
	}
}

func TestUpdateUserRoles(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "roleuser@example.com",
		PasswordHash: "hash",
		FirstName:    "Role",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	input := map[string]interface{}{"roles": []string{"org_admin"}, "permissions": []string{"articles:write"}}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPut, "/users/"+user.ID.Hex()+"/roles", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.UpdateUserRoles(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	updated, _ := h.Repo.GetUserByID(user.ID)
	if len(updated.Roles) != 1 || updated.Roles[0] != "org_admin" {
		t.Fatalf("expected role org_admin, got %+v", updated.Roles)
	}
	if len(updated.Permissions) != 1 || updated.Permissions[0] != "articles:write" {
		t.Fatalf("expected permission articles:write, got %+v", updated.Permissions)
	}
}

func TestCreateUser_DuplicateEmail(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "dup@example.com",
		PasswordHash: "hash",
		FirstName:    "Dup",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	body, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.CreateUser(w, req)
	if w.Code != http.StatusInternalServerError && w.Code != http.StatusConflict {
		t.Fatalf("expected 409 or 500, got %d", w.Code)
	}
}

func TestCreateUser_InvalidRole(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "invalidrole@example.com",
		PasswordHash: "hash",
		FirstName:    "Invalid",
		LastName:     "Role",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"notarole"},
		Permissions:  []string{"articles:read"},
	}
	body, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.CreateUser(w, req)
	if w.Code != http.StatusBadRequest && w.Code != http.StatusInternalServerError {
		t.Fatalf("expected 400 or 500, got %d", w.Code)
	}
}

func TestUpdateUser_NotFound(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	fakeID := primitive.NewObjectID()
	update := map[string]interface{}{"first_name": "Nope"}
	body, _ := json.Marshal(update)
	req := httptest.NewRequest(http.MethodPut, "/users/"+fakeID.Hex(), bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.UpdateUser(w, req)
	if w.Code != http.StatusInternalServerError && w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 or 500, got %d", w.Code)
	}
}

func TestDeleteUser_NotFound(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	fakeID := primitive.NewObjectID()
	req := httptest.NewRequest(http.MethodDelete, "/users/"+fakeID.Hex(), nil)
	w := httptest.NewRecorder()
	h.DeleteUser(w, req)
	if w.Code != http.StatusInternalServerError && w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 or 500, got %d", w.Code)
	}
}

func TestInviteUser_InvalidEmail(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	input := map[string]string{"email": "notanemail"}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/users/invite", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.InviteUser(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestInviteUser_DuplicateEmail(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	user := users.User{
		Email:        "inviteexists@example.com",
		PasswordHash: "hash",
		FirstName:    "Invite",
		LastName:     "Exists",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
		Roles:        []string{"user"},
		Permissions:  []string{"articles:read"},
	}
	h.Repo.CreateUser(&user)
	input := map[string]string{"email": "inviteexists@example.com"}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/users/invite", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.InviteUser(w, req)
	if w.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", w.Code)
	}
}

func TestGetMe_Unauthorized(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	req := httptest.NewRequest(http.MethodGet, "/users/me", nil)
	w := httptest.NewRecorder()
	h.GetMe(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}
