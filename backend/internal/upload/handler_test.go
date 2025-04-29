package upload

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/minio/minio-go/v7"
)

type mockMinioClient struct {
	fail bool
}

func (m *mockMinioClient) PutObject(ctx context.Context, bucket, object string, reader io.Reader, size int64, opts minio.PutObjectOptions) (minio.UploadInfo, error) {
	if m.fail {
		return minio.UploadInfo{}, io.ErrUnexpectedEOF
	}
	return minio.UploadInfo{}, nil
}

func (m *mockMinioClient) BucketExists(ctx context.Context, bucket string) (bool, error) {
	return true, nil
}
func (m *mockMinioClient) MakeBucket(ctx context.Context, bucket string, opts minio.MakeBucketOptions) error {
	return nil
}

func TestUploadHandler_InvalidFile(t *testing.T) {
	h := NewHandler(&mockMinioClient{})
	req := httptest.NewRequest(http.MethodPost, "/upload", nil)
	w := httptest.NewRecorder()
	h.UploadHandler(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestUploadHandler_Success(t *testing.T) {
	h := NewHandler(&mockMinioClient{})
	var b bytes.Buffer
	mw := multipart.NewWriter(&b)
	fw, _ := mw.CreateFormFile("file", "test.txt")
	fw.Write([]byte("hello"))
	mw.Close()

	req := httptest.NewRequest(http.MethodPost, "/upload", &b)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	w := httptest.NewRecorder()
	os.Setenv("MINIO_PUBLIC_URL_BASE", "http://mock")
	h.UploadHandler(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "http://mock/mybucket/") {
		t.Fatalf("unexpected body: %s", w.Body.String())
	}
}

func TestUploadHandler_ErrorOnPutObject(t *testing.T) {
	h := NewHandler(&mockMinioClient{fail: true})
	var b bytes.Buffer
	mw := multipart.NewWriter(&b)
	fw, _ := mw.CreateFormFile("file", "test.txt")
	fw.Write([]byte("hello"))
	mw.Close()

	req := httptest.NewRequest(http.MethodPost, "/upload", &b)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	w := httptest.NewRecorder()
	h.UploadHandler(w, req)
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", w.Code)
	}
}

func TestUploadProfileImageHandler_InvalidFile(t *testing.T) {
	h := NewHandler(&mockMinioClient{})
	req := httptest.NewRequest(http.MethodPost, "/upload/profile", nil)
	w := httptest.NewRecorder()
	h.UploadProfileImageHandler(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestUploadProfileImageHandler_Success(t *testing.T) {
	h := NewHandler(&mockMinioClient{})
	var b bytes.Buffer
	mw := multipart.NewWriter(&b)
	fw, _ := mw.CreateFormFile("file", "profile.png")
	fw.Write([]byte("imgdata"))
	mw.Close()

	req := httptest.NewRequest(http.MethodPost, "/upload/profile", &b)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	w := httptest.NewRecorder()
	os.Setenv("MINIO_PUBLIC_URL_BASE", "http://mock")
	h.UploadProfileImageHandler(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "http://mock/mybucket/") {
		t.Fatalf("unexpected body: %s", w.Body.String())
	}
}

func TestUploadProfileImageHandler_ErrorOnPutObject(t *testing.T) {
	h := NewHandler(&mockMinioClient{fail: true})
	var b bytes.Buffer
	mw := multipart.NewWriter(&b)
	fw, _ := mw.CreateFormFile("file", "profile.png")
	fw.Write([]byte("imgdata"))
	mw.Close()

	req := httptest.NewRequest(http.MethodPost, "/upload/profile", &b)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	w := httptest.NewRecorder()
	h.UploadProfileImageHandler(w, req)
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", w.Code)
	}
}
