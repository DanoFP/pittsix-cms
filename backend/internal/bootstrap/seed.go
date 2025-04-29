package bootstrap

import (
	"log"
	"pittsix/internal/organizations"
	"pittsix/internal/users"
	"pittsix/pkg/security"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func InitUsersAndOrgs(userRepo users.Repository, orgRepo organizations.Repository) {
	const adminEmail = "admin@admin.com"
	const adminPassword = "admin123"
	const orgName = "Org Principal"

	// Crear organización si no existe
	org, err := orgRepo.GetByName(orgName)
	if err != nil {
		org = &organizations.Organization{
			ID:   primitive.NewObjectID(),
			Name: orgName,
		}
		err = orgRepo.Create(org)
		if err != nil {
			log.Printf("[bootstrap] Error creating org: %v", err)
			return
		}
	}

	_, err = userRepo.GetUserByEmail(adminEmail)
	if err == nil {
		log.Println("[bootstrap] Admin user already exists")
		return
	}

	hash := security.HashPassword(adminPassword, "")
	admin := &users.User{
		Email:          adminEmail,
		PasswordHash:   hash,
		FirstName:      "Admin",
		LastName:       "Root",
		Bio:            "Superusuario",
		ProfileImage:   "",
		OrganizationID: org.ID,
		Roles:          []string{"superadmin", "org_admin"},
		Permissions:    []string{"*"},
	}
	err = userRepo.CreateUser(admin)
	if err != nil {
		log.Printf("[bootstrap] Error creating admin: %v", err)
	} else {
		log.Println("[bootstrap] Admin user created")
	}
}
