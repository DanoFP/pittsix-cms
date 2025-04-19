package articles

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// 🌱 Mongo Collection
var Collection *mongo.Collection

// 🛠️ Inicializar desde main.go
func Init(collection *mongo.Collection) {
	Collection = collection
}

// 🧱 Modelo de artículo
type Article struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title     string             `bson:"title" json:"title"`
	Content   string             `bson:"content" json:"content"`
	Image     string             `bson:"image,omitempty" json:"image,omitempty"`
	AuthorID  int                `bson:"author_id" json:"author_id"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// 📥 Crear artículo (requiere JWT)
func CreateArticleHandler(w http.ResponseWriter, r *http.Request) {
	var article Article
	if err := json.NewDecoder(r.Body).Decode(&article); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)
	article.AuthorID = userID
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()

	res, err := Collection.InsertOne(context.Background(), article)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	article.ID = res.InsertedID.(primitive.ObjectID)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(article)
}

// 📤 Listar todos (público)
func ListArticlesHandler(w http.ResponseWriter, r *http.Request) {
	cursor, err := Collection.Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var articles []Article
	for cursor.Next(context.Background()) {
		var art Article
		if err := cursor.Decode(&art); err == nil {
			articles = append(articles, art)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(articles)
}

// 🙋 Listar solo artículos del usuario (requiere JWT)
func GetMyArticlesHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(int)
	cursor, err := Collection.Find(context.Background(), bson.M{"author_id": userID})
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var articles []Article
	for cursor.Next(context.Background()) {
		var art Article
		if err := cursor.Decode(&art); err == nil {
			articles = append(articles, art)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(articles)
}

// ✏️ Editar (requiere JWT y autoría)
func UpdateArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)

	var payload Article
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	filter := bson.M{"_id": objID, "author_id": userID}
	update := bson.M{"$set": bson.M{
		"title":      payload.Title,
		"content":    payload.Content,
		"image":      payload.Image,
		"updated_at": time.Now(),
	}}

	res, err := Collection.UpdateOne(context.Background(), filter, update)
	if err != nil || res.MatchedCount == 0 {
		http.Error(w, "Not authorized or not found", http.StatusForbidden)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func DeleteArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	log.Println("🔍 Recibido ID para borrar:", id)

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Println("❌ ID inválido:", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(int)
	res, err := Collection.DeleteOne(context.Background(), bson.M{
		"_id":       objID,
		"author_id": userID,
	})

	if err != nil {
		log.Println("❌ Error al borrar:", err)
		http.Error(w, "Delete failed", http.StatusInternalServerError)
		return
	}

	if res.DeletedCount == 0 {
		log.Println("⚠️ No se encontró o no es tuyo")
		http.Error(w, "Not authorized or not found", http.StatusForbidden)
		return
	}

	log.Println("✅ Artículo borrado correctamente")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func GetArticleByIDHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	log.Println("🔎 Buscando artículo con ID:", id)

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Println("❌ ID inválido:", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var article bson.M
	err = Collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&article)
	if err != nil {
		log.Println("❌ Artículo no encontrado:", err)
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}
