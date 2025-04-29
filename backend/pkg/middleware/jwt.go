package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte("secret"), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["user_id"] == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		userID, ok := claims["user_id"].(string)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		orgID, _ := claims["organization_id"].(string)
		roles, _ := claims["roles"].([]interface{})
		permissions, _ := claims["permissions"].([]interface{})
		// Convert []interface{} a []string
		var rolesStr, permsStr []string
		for _, r := range roles {
			if s, ok := r.(string); ok {
				rolesStr = append(rolesStr, s)
			}
		}
		for _, p := range permissions {
			if s, ok := p.(string); ok {
				permsStr = append(permsStr, s)
			}
		}
		ctx := context.WithValue(r.Context(), "user_id", userID)
		ctx = context.WithValue(ctx, "organization_id", orgID)
		ctx = context.WithValue(ctx, "roles", rolesStr)
		ctx = context.WithValue(ctx, "permissions", permsStr)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
