package users

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email            string             `bson:"email" json:"email"`
	PasswordHash     string             `bson:"password_hash" json:"password_hash"`
	FirstName        string             `bson:"first_name" json:"first_name"`
	LastName         string             `bson:"last_name" json:"last_name"`
	Bio              string             `bson:"bio" json:"bio"`
	ProfileImage     string             `bson:"profile_image" json:"profile_image"`
	CreatedAt        int64              `bson:"created_at" json:"created_at"`
	UpdatedAt        int64              `bson:"updated_at" json:"updated_at"`
	OrganizationID   primitive.ObjectID `bson:"organization_id,omitempty" json:"organization_id"`
	Roles            []string           `bson:"roles" json:"roles"`
	Permissions      []string           `bson:"permissions" json:"permissions"`
	ResetToken       string             `bson:"reset_token,omitempty" json:"-"`
	ResetTokenExpiry int64              `bson:"reset_token_expiry,omitempty" json:"-"`
}

type Repository interface {
	CreateUser(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByID(id primitive.ObjectID) (*User, error)
	UpdateUserProfile(id primitive.ObjectID, update map[string]interface{}) error
	GetUsersByOrganization(orgID string) ([]User, error)
	UpdateUser(id primitive.ObjectID, update map[string]interface{}) error
	DeleteUser(id primitive.ObjectID) error
	UpdateUserRoles(id primitive.ObjectID, roles, permissions []string) error
}
