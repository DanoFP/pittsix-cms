package security

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("secret")

func HashPassword(password, pepper string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password+pepper), bcrypt.DefaultCost)
	return string(hash)
}

func CheckPassword(password, hash, pepper string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password+pepper))
	return err == nil
}

func GenerateJWT(userID int) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString(jwtKey)
}
