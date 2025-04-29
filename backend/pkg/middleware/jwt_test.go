package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func makeJWT(t *testing.T, claims jwt.MapClaims) string {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString([]byte("secret"))
	if err != nil {
		t.Fatalf("jwt sign error: %v", err)
	}
	return s
}

func TestJWTAuth_ValidToken(t *testing.T) {
	claims := jwt.MapClaims{"user_id": "u1", "organization_id": "o1", "roles": []string{"admin"}, "permissions": []string{"*"}}
	token := makeJWT(t, claims)
	h := JWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Errorf("should allow valid token")
	}
}

func TestJWTAuth_InvalidToken(t *testing.T) {
	h := JWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalidtoken")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("should reject invalid token")
	}
}

func TestJWTAuth_NoToken(t *testing.T) {
	h := JWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("should reject missing token")
	}
}

func TestJWTAuth_MissingClaims(t *testing.T) {
	claims := jwt.MapClaims{"foo": "bar"}
	token := makeJWT(t, claims)
	h := JWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("should reject missing claims")
	}
}
