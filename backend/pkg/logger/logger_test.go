package logger

import (
	"testing"
)

func TestInit(t *testing.T) {
	Init("production")
	if Log == nil {
		t.Error("Log should not be nil in production")
	}
	Init("development")
	if Log == nil {
		t.Error("Log should not be nil in development")
	}
}
