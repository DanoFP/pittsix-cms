package config

import (
	"os"
)

type Config struct {
	Env      string
	Server   ServerConfig
	Security SecurityConfig
}

type ServerConfig struct {
	Port string
}

type SecurityConfig struct {
	Pepper string
}

func LoadConfig() Config {
	return Config{
		Env: os.Getenv("ENV"),
		Server: ServerConfig{
			Port: ":8080",
		},
		Security: SecurityConfig{
			Pepper: os.Getenv("PEPPER"),
		},
	}
}
