package organizations

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Organization struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string             `bson:"name" json:"name"`
	// Puedes agregar más campos si lo necesitas
}

type Repository interface {
	Create(org *Organization) error
	GetByName(name string) (*Organization, error)
	GetByID(id primitive.ObjectID) (*Organization, error)
	Update(id primitive.ObjectID, update map[string]interface{}) error
	Delete(id primitive.ObjectID) error
}
