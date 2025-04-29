package security

import (
	"testing"
)

func TestHashAndCheckPassword(t *testing.T) {
	hash := HashPassword("foo", "bar")
	if !CheckPassword("foo", hash, "bar") {
		t.Error("should validate correct password")
	}
	if CheckPassword("foo", hash, "baz") {
		t.Error("should not validate wrong pepper")
	}
	if CheckPassword("wrong", hash, "bar") {
		t.Error("should not validate wrong password")
	}
}

func TestGenerateJWT(t *testing.T) {
	tok, err := GenerateJWT("u1", "o1", []string{"admin"}, []string{"*"})
	if err != nil {
		t.Fatalf("jwt error: %v", err)
	}
	if len(tok) < 10 {
		t.Error("token too short")
	}
}
