package organizations

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(collection *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: collection}
}

func (r *MongoRepository) Create(org *Organization) error {
	org.ID = primitive.NewObjectID()
	_, err := r.collection.InsertOne(context.Background(), org)
	return err
}

func (r *MongoRepository) GetByName(name string) (*Organization, error) {
	var org Organization
	err := r.collection.FindOne(context.Background(), bson.M{"name": name}).Decode(&org)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("not found")
		}
		return nil, err
	}
	return &org, nil
}

func (r *MongoRepository) GetByID(id primitive.ObjectID) (*Organization, error) {
	var org Organization
	err := r.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&org)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("not found")
		}
		return nil, err
	}
	return &org, nil
}

func (r *MongoRepository) Update(id primitive.ObjectID, update map[string]interface{}) error {
	_, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": update},
	)
	return err
}

func (r *MongoRepository) Delete(id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}
