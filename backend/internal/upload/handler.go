package upload

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"context"

	"github.com/minio/minio-go/v7"
)

type MinioClient interface {
	PutObject(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, opts minio.PutObjectOptions) (minio.UploadInfo, error)
	BucketExists(ctx context.Context, bucketName string) (bool, error)
	MakeBucket(ctx context.Context, bucketName string, opts minio.MakeBucketOptions) error
}

type Handler struct {
	Client MinioClient
}

func NewHandler(client MinioClient) *Handler {
	return &Handler{Client: client}
}

func (h *Handler) UploadHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("❌ Error leyendo archivo: %v", err)
		http.Error(w, "Archivo inválido", http.StatusBadRequest)
		return
	}
	defer file.Close()
	objectName := fmt.Sprintf("upload_%d_%s", time.Now().Unix(), header.Filename)
	uploadInfo, err := h.Client.PutObject(ctx, "mybucket", objectName, file, header.Size, minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		log.Printf("❌ Error subiendo a MinIO: %v", err)
		http.Error(w, "Error interno al subir", http.StatusInternalServerError)
		return
	}
	baseURL := os.Getenv("MINIO_PUBLIC_URL_BASE")
	if baseURL == "" {
		baseURL = "http://localhost:9000"
	}
	publicURL := fmt.Sprintf("%s/mybucket/%s", baseURL, objectName)
	log.Printf("✅ Archivo subido: %+v", uploadInfo)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"url":"%s"}`, publicURL)))
}

func (h *Handler) UploadProfileImageHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("❌ Error leyendo archivo: %v", err)
		http.Error(w, "Archivo inválido", http.StatusBadRequest)
		return
	}
	defer file.Close()
	objectName := fmt.Sprintf("profile_%d_%s", time.Now().Unix(), header.Filename)
	uploadInfo, err := h.Client.PutObject(ctx, "mybucket", objectName, file, header.Size, minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		log.Printf("❌ Error subiendo a MinIO: %v", err)
		http.Error(w, "Error interno al subir", http.StatusInternalServerError)
		return
	}
	baseURL := os.Getenv("MINIO_PUBLIC_URL_BASE")
	if baseURL == "" {
		baseURL = "http://localhost:9000"
	}
	publicURL := fmt.Sprintf("%s/mybucket/%s", baseURL, objectName)
	log.Printf("✅ Foto de perfil subida: %+v", uploadInfo)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"url":"%s"}`, publicURL)))
}
