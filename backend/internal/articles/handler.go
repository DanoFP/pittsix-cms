package articles

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"pittsix/internal/users"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// 🌱 Mongo Collection
var Collection *mongo.Collection
var userRepo users.Repository

// 🛠️ Inicializar desde main.go
func Init(collection *mongo.Collection, uRepo users.Repository) {
	Collection = collection
	userRepo = uRepo
}

// 🧱 Modelo de artículo
type Article struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title      string             `bson:"title" json:"title"`
	Content    string             `bson:"content" json:"content"`
	Image      string             `bson:"image,omitempty" json:"image,omitempty"`
	Slug       string             `bson:"slug" json:"slug"`
	AuthorID   primitive.ObjectID `bson:"author_id" json:"author_id"`
	AuthorName string             `bson:"author_name" json:"author_name"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
}

// GenerateSlug genera un slug amigable a partir del título
func GenerateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	slug = regexp.MustCompile(`[^a-z0-9-]+`).ReplaceAllString(slug, "")
	slug = strings.Trim(slug, "-")
	return slug
}

// 📥 Crear artículo (requiere JWT)
func CreateArticleHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("📩 Nuevo artículo recibido: %+v", r)

	var article Article
	if err := json.NewDecoder(r.Body).Decode(&article); err != nil {
		log.Println(err.Error())
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	userIDStr, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	article.AuthorID = userObjID

	// Buscar nombre del autor usando el repo global
	user, err := userRepo.GetUserByID(userObjID)
	if err == nil && user != nil {
		article.AuthorName = user.FirstName + " " + user.LastName
	}

	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	article.Slug = GenerateSlug(article.Title)
	if article.Status == "" {
		article.Status = "draft"
	}

	res, err := Collection.InsertOne(context.Background(), article)
	if err != nil {
		log.Println(err.Error())
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
		log.Println(err.Error())
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
	userIDStr, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	cursor, err := Collection.Find(context.Background(), bson.M{"author_id": userObjID})
	if err != nil {
		log.Println(err.Error())
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
		log.Println(err.Error())
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	userIDStr, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	var payload Article
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Println(err.Error())
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	newSlug := GenerateSlug(payload.Title)

	filter := bson.M{"_id": objID, "author_id": userObjID}
	update := bson.M{"$set": bson.M{
		"title":      payload.Title,
		"content":    payload.Content,
		"image":      payload.Image,
		"slug":       newSlug,
		"status":     payload.Status,
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

	userIDStr, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	res, err := Collection.DeleteOne(context.Background(), bson.M{
		"_id":       objID,
		"author_id": userObjID,
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

// Handler para buscar artículo por slug
func GetArticleBySlugHandler(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	var article Article
	err := Collection.FindOne(context.Background(), bson.M{"slug": slug}).Decode(&article)
	if err != nil {
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}
