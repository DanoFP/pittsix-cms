package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireRole(t *testing.T) {
	h := RequireRole("admin")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	req := httptest.NewRequest("GET", "/", nil)
	req = req.WithContext(context.WithValue(req.Context(), "roles", []string{"user", "admin"}))
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Errorf("should allow admin role")
	}

	req = httptest.NewRequest("GET", "/", nil)
	req = req.WithContext(context.WithValue(req.Context(), "roles", []string{"user"}))
	w = httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != http.StatusForbidden {
		t.Errorf("should forbid non-admin role")
	}
}

func TestRequireOrgAdminOrSuperadmin(t *testing.T) {
	h := RequireOrgAdminOrSuperadmin()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	for _, role := range [][]string{{"org_admin"}, {"superadmin"}} {
		req := httptest.NewRequest("GET", "/", nil)
		req = req.WithContext(context.WithValue(req.Context(), "roles", role))
		w := httptest.NewRecorder()
		h.ServeHTTP(w, req)
		if w.Code != 200 {
			t.Errorf("should allow %v", role)
		}
	}
	req := httptest.NewRequest("GET", "/", nil)
	req = req.WithContext(context.WithValue(req.Context(), "roles", []string{"user"}))
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != http.StatusForbidden {
		t.Errorf("should forbid non-admin roles")
	}
}

func TestRequirePermission(t *testing.T) {
	h := RequirePermission("articles:read")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	cases := []struct {
		perms []string
		want  int
	}{
		{[]string{"articles:read"}, 200},
		{[]string{"*"}, 200},
		{[]string{"articles:read:own"}, 200},
		{[]string{"articles:write"}, http.StatusForbidden},
	}
	for _, c := range cases {
		req := httptest.NewRequest("GET", "/", nil)
		req = req.WithContext(context.WithValue(req.Context(), "permissions", c.perms))
		w := httptest.NewRecorder()
		h.ServeHTTP(w, req)
		if w.Code != c.want {
			t.Errorf("perms %v: got %d, want %d", c.perms, w.Code, c.want)
		}
	}
}
