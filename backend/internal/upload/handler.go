package upload

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "os"

    "github.com/minio/minio-go/v7"
    "github.com/minio/minio-go/v7/pkg/credentials"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
    r.ParseMultipartForm(10 << 20) // 10MB max

    file, handler, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "Invalid file", http.StatusBadRequest)
        return
    }
    defer file.Close()

    tmp, err := os.CreateTemp("", "upload-*")
    if err != nil {
        http.Error(w, "Temp error", http.StatusInternalServerError)
        return
    }
    defer os.Remove(tmp.Name())

    _, err = io.Copy(tmp, file)
    if err != nil {
        http.Error(w, "Copy error", http.StatusInternalServerError)
        return
    }

    tmp.Seek(0, io.SeekStart)

    minioClient, err := minio.New("localhost:9000", &minio.Options{
        Creds:  credentials.NewStaticV4("minio", "minio123", ""),
        Secure: false,
    })
    if err != nil {
        http.Error(w, "MinIO error", http.StatusInternalServerError)
        return
    }

    objectName := handler.Filename
    _, err = minioClient.FPutObject(context.Background(), "mybucket", objectName, tmp.Name(), minio.PutObjectOptions{ContentType: handler.Header.Get("Content-Type")})
    if err != nil {
        http.Error(w, "Upload failed", http.StatusInternalServerError)
        return
    }

    url := fmt.Sprintf("http://localhost:9000/mybucket/%s", objectName)
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(fmt.Sprintf(`{"url":"%s"}`, url)))
}