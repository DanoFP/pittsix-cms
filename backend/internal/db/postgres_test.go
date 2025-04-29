package db

import (
	"errors"
	"testing"
)

func TestIsAlreadyExists(t *testing.T) {
	err := errors.New("pq: database \"pittsix\" already exists")
	if !isAlreadyExists(err) {
		t.Error("should detect already exists error")
	}
	if isAlreadyExists(errors.New("other error")) {
		t.Error("should not detect unrelated error")
	}
	if isAlreadyExists(nil) {
		t.Error("should not detect nil error")
	}
}

// NOTA: No se testean MustGetPostgres ni InitPostgres porque requieren una base real y hacen log.Fatalf.
// Para cobertura real, se recomienda refactorizar para inyectar el DSN y usar sqlmock en tests.
