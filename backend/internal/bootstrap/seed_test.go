package bootstrap

import (
	"errors"
	"testing"

	"pittsix/internal/organizations"
	"pittsix/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type mockOrgRepo struct {
	orgs       map[string]*organizations.Organization
	failCreate bool
}

func (m *mockOrgRepo) Create(org *organizations.Organization) error {
	if m.failCreate {
		return errors.New("fail create org")
	}
	m.orgs[org.Name] = org
	return nil
}
func (m *mockOrgRepo) GetByName(name string) (*organizations.Organization, error) {
	org, ok := m.orgs[name]
	if !ok {
		return nil, errors.New("not found")
	}
	return org, nil
}
func (m *mockOrgRepo) GetByID(id primitive.ObjectID) (*organizations.Organization, error) {
	return nil, nil
}
func (m *mockOrgRepo) Update(id primitive.ObjectID, update map[string]interface{}) error { return nil }
func (m *mockOrgRepo) Delete(id primitive.ObjectID) error                                { return nil }

type mockUserRepo struct {
	users      map[string]*users.User
	failCreate bool
}

func (m *mockUserRepo) CreateUser(u *users.User) error {
	if m.failCreate {
		return errors.New("fail create user")
	}
	m.users[u.Email] = u
	return nil
}
func (m *mockUserRepo) GetUserByEmail(email string) (*users.User, error) {
	u, ok := m.users[email]
	if !ok {
		return nil, errors.New("not found")
	}
	return u, nil
}
func (m *mockUserRepo) GetUserByID(id primitive.ObjectID) (*users.User, error) { return nil, nil }
func (m *mockUserRepo) UpdateUserProfile(id primitive.ObjectID, update map[string]interface{}) error {
	return nil
}
func (m *mockUserRepo) GetUsersByOrganization(orgID string) ([]users.User, error) { return nil, nil }
func (m *mockUserRepo) UpdateUser(id primitive.ObjectID, update map[string]interface{}) error {
	return nil
}
func (m *mockUserRepo) DeleteUser(id primitive.ObjectID) error { return nil }
func (m *mockUserRepo) UpdateUserRoles(id primitive.ObjectID, roles, permissions []string) error {
	return nil
}

func TestInitUsersAndOrgs_CreatesOrgAndAdmin(t *testing.T) {
	orgRepo := &mockOrgRepo{orgs: map[string]*organizations.Organization{}}
	userRepo := &mockUserRepo{users: map[string]*users.User{}}
	InitUsersAndOrgs(userRepo, orgRepo)
	if orgRepo.orgs["Org Principal"] == nil {
		t.Fatal("organization not created")
	}
	if userRepo.users["admin@admin.com"] == nil {
		t.Fatal("admin user not created")
	}
}

func TestInitUsersAndOrgs_OrgExists_AdminCreated(t *testing.T) {
	org := &organizations.Organization{Name: "Org Principal"}
	orgRepo := &mockOrgRepo{orgs: map[string]*organizations.Organization{"Org Principal": org}}
	userRepo := &mockUserRepo{users: map[string]*users.User{}}
	InitUsersAndOrgs(userRepo, orgRepo)
	if userRepo.users["admin@admin.com"] == nil {
		t.Fatal("admin user not created when org exists")
	}
}

func TestInitUsersAndOrgs_AdminExists(t *testing.T) {
	org := &organizations.Organization{Name: "Org Principal"}
	orgRepo := &mockOrgRepo{orgs: map[string]*organizations.Organization{"Org Principal": org}}
	userRepo := &mockUserRepo{users: map[string]*users.User{"admin@admin.com": {Email: "admin@admin.com"}}}
	InitUsersAndOrgs(userRepo, orgRepo)
	// No debe crear otro admin ni fallar
}

func TestInitUsersAndOrgs_ErrorCreatingOrg(t *testing.T) {
	orgRepo := &mockOrgRepo{orgs: map[string]*organizations.Organization{}, failCreate: true}
	userRepo := &mockUserRepo{users: map[string]*users.User{}}
	InitUsersAndOrgs(userRepo, orgRepo)
	if len(userRepo.users) != 0 {
		t.Fatal("should not create admin if org creation fails")
	}
}

func TestInitUsersAndOrgs_ErrorCreatingAdmin(t *testing.T) {
	org := &organizations.Organization{Name: "Org Principal"}
	orgRepo := &mockOrgRepo{orgs: map[string]*organizations.Organization{"Org Principal": org}}
	userRepo := &mockUserRepo{users: map[string]*users.User{}, failCreate: true}
	InitUsersAndOrgs(userRepo, orgRepo)
	if userRepo.users["admin@admin.com"] != nil {
		t.Fatal("admin should not be created if userRepo fails")
	}
}
