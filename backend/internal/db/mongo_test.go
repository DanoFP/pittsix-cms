package db

import (
	"testing"
)

func TestConnectMongo_Skip(t *testing.T) {
	t.Skip("No se testea ConnectMongo porque requiere MongoDB real y hace log.Fatalf en error. Para cobertura real, refactorizar para inyectar el URI y usar mongo/integration test.")
}
