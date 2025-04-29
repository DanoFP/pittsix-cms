package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	os.Setenv("ENV", "testenv")
	os.Setenv("PEPPER", "pepper123")
	cfg := LoadConfig()
	if cfg.Env != "testenv" {
		t.Errorf("expected ENV to be testenv, got %s", cfg.Env)
	}
	if cfg.Security.Pepper != "pepper123" {
		t.Errorf("expected PEPPER to be pepper123, got %s", cfg.Security.Pepper)
	}
	if cfg.Server.Port != ":8080" {
		t.Errorf("expected default port :8080, got %s", cfg.Server.Port)
	}
}
