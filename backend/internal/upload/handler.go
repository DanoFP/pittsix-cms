package upload

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"context"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var minioClient *minio.Client

func init() {
	var err error
	minioClient, err = minio.New("minio:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("minio", "minio123", ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("❌ Error conectando a MinIO: %v", err)
	}

	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, "mybucket")
	if err != nil {
		log.Fatalf("❌ Error comprobando bucket: %v", err)
	}
	if !exists {
		err := minioClient.MakeBucket(ctx, "mybucket", minio.MakeBucketOptions{})
		if err != nil {
			log.Fatalf("❌ Error creando bucket: %v", err)
		}
	}

	log.Println("✅ MinIO inicializado correctamente")
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("❌ Error leyendo archivo: %v", err)
		http.Error(w, "Archivo inválido", http.StatusBadRequest)
		return
	}
	defer file.Close()

	objectName := fmt.Sprintf("upload_%d_%s", time.Now().Unix(), header.Filename)

	uploadInfo, err := minioClient.PutObject(ctx, "mybucket", objectName, file, header.Size, minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		log.Printf("❌ Error subiendo a MinIO: %v", err)
		http.Error(w, "Error interno al subir", http.StatusInternalServerError)
		return
	}

	publicURL := fmt.Sprintf("http://localhost:9000/mybucket/%s", objectName)

	log.Printf("✅ Archivo subido: %+v", uploadInfo)

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"url":"%s"}`, publicURL)))
}
