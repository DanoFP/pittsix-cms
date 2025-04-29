package users

import (
	"context"
	"errors"
	"time"

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

func (r *MongoRepository) CreateUser(user *User) error {
	user.ID = primitive.NewObjectID()
	now := time.Now().Unix()
	user.CreatedAt = now
	user.UpdatedAt = now
	_, err := r.collection.InsertOne(context.Background(), user)
	return err
}

func (r *MongoRepository) GetUserByEmail(email string) (*User, error) {
	var user User
	err := r.collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *MongoRepository) GetUserByID(id primitive.ObjectID) (*User, error) {
	var user User
	err := r.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *MongoRepository) UpdateUserProfile(id primitive.ObjectID, update map[string]interface{}) error {
	update["updated_at"] = time.Now().Unix()
	_, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": update},
	)
	return err
}

func (r *MongoRepository) Collection() *mongo.Collection {
	return r.collection
}

func (r *MongoRepository) GetUsersByOrganization(orgID string) ([]User, error) {
	oid, err := primitive.ObjectIDFromHex(orgID)
	if err != nil {
		return nil, err
	}
	cur, err := r.collection.Find(context.Background(), bson.M{"organization_id": oid})
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.Background())
	var users []User
	for cur.Next(context.Background()) {
		var u User
		if err := cur.Decode(&u); err == nil {
			users = append(users, u)
		}
	}
	return users, cur.Err()
}

func (r *MongoRepository) UpdateUser(id primitive.ObjectID, update map[string]interface{}) error {
	update["updated_at"] = time.Now().Unix()
	_, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": update},
	)
	return err
}

func (r *MongoRepository) DeleteUser(id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}

func (r *MongoRepository) UpdateUserRoles(id primitive.ObjectID, roles, permissions []string) error {
	update := bson.M{
		"roles":       roles,
		"permissions": permissions,
		"updated_at":  time.Now().Unix(),
	}
	_, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": update},
	)
	return err
}
