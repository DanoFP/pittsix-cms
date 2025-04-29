package auth_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pittsix/internal/auth"
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

func setupHandlers() *auth.Handlers {
	repo := users.NewMongoRepository(testColl)
	return auth.NewAuthHandlers(repo)
}

func TestRegisterAndLogin(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	// Registro
	creds := map[string]string{"email": "testauth@example.com", "password": "secret"}
	body, _ := json.Marshal(creds)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.Register(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	// Login
	req = httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	w = httptest.NewRecorder()
	h.Login(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp map[string]string
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode login resp: %v", err)
	}
	if resp["token"] == "" {
		t.Fatalf("expected token in login resp")
	}
}

func TestProfile(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	// Crear usuario
	u := users.User{
		Email:        "profile@example.com",
		PasswordHash: "hash",
		FirstName:    "Profile",
		LastName:     "User",
		CreatedAt:    time.Now().Unix(),
		UpdatedAt:    time.Now().Unix(),
	}
	repo := users.NewMongoRepository(testColl)
	repo.CreateUser(&u)
	// Simular contexto con user_id
	req := httptest.NewRequest(http.MethodGet, "/profile", nil)
	ctx := context.WithValue(req.Context(), "user_id", u.ID.Hex())
	w := httptest.NewRecorder()
	h.Profile(w, req.WithContext(ctx))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var got users.User
	if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
		t.Fatalf("failed to decode profile: %v", err)
	}
	if got.Email != u.Email {
		t.Fatalf("expected email %s, got %s", u.Email, got.Email)
	}
}
