package organizations_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pittsix/internal/organizations"
	"pittsix/internal/users"
)

var testColl *mongo.Collection

func TestMain(m *testing.M) {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		panic(err)
	}
	testColl = client.Database("test_pittsix_orgs").Collection("organizations")
	testColl.Drop(context.Background())
	code := m.Run()
	testColl.Drop(context.Background())
	os.Exit(code)
}

func setupHandlers() *organizations.Handlers {
	repo := organizations.NewMongoRepository(testColl)
	// Para userRepo, creamos una colección de usuarios de test separada
	client, _ := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	usersColl := client.Database("test_pittsix_users").Collection("users")
	usersRepo := users.NewMongoRepository(usersColl)
	return organizations.NewHandlers(repo, usersRepo)
}

func TestCreateAndListOrganization(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	org := organizations.Organization{Name: "TestOrg"}
	body, _ := json.Marshal(org)
	req := httptest.NewRequest(http.MethodPost, "/organizations", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.CreateOrganization(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	req = httptest.NewRequest(http.MethodGet, "/organizations", nil)
	w = httptest.NewRecorder()
	h.ListOrganizations(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var orgs []organizations.Organization
	if err := json.NewDecoder(w.Body).Decode(&orgs); err != nil {
		t.Fatalf("failed to decode orgs: %v", err)
	}
	if len(orgs) != 1 || orgs[0].Name != "TestOrg" {
		t.Fatalf("unexpected orgs: %+v", orgs)
	}
}

func TestUpdateOrganization(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	org := organizations.Organization{Name: "UpdateOrg"}
	body, _ := json.Marshal(org)
	h.CreateOrganization(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/organizations", bytes.NewReader(body)))
	var created organizations.Organization
	_ = json.Unmarshal(body, &created)
	// Buscar el ID real
	cur, _ := testColl.Find(context.Background(), primitive.M{"name": "UpdateOrg"})
	cur.Next(context.Background())
	cur.Decode(&created)
	update := map[string]interface{}{"name": "UpdatedOrg"}
	updateBody, _ := json.Marshal(update)
	req := httptest.NewRequest(http.MethodPut, "/organizations/"+created.ID.Hex(), bytes.NewReader(updateBody))
	w := httptest.NewRecorder()
	h.UpdateOrganization(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	// Verificar actualización
	cur, _ = testColl.Find(context.Background(), primitive.M{"_id": created.ID})
	cur.Next(context.Background())
	cur.Decode(&created)
	if created.Name != "UpdatedOrg" {
		t.Fatalf("expected name UpdatedOrg, got %s", created.Name)
	}
}

func TestDeleteOrganization(t *testing.T) {
	testColl.Drop(context.Background())
	h := setupHandlers()
	org := organizations.Organization{Name: "DeleteOrg"}
	body, _ := json.Marshal(org)
	h.CreateOrganization(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/organizations", bytes.NewReader(body)))
	var created organizations.Organization
	cur, _ := testColl.Find(context.Background(), primitive.M{"name": "DeleteOrg"})
	cur.Next(context.Background())
	cur.Decode(&created)
	req := httptest.NewRequest(http.MethodDelete, "/organizations/"+created.ID.Hex(), nil)
	w := httptest.NewRecorder()
	h.DeleteOrganization(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	// Verificar que no existe
	cur, _ = testColl.Find(context.Background(), primitive.M{"_id": created.ID})
	if cur.Next(context.Background()) {
		t.Fatalf("expected org deleted, but found")
	}
}
