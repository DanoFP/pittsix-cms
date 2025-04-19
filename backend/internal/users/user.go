package users

import (
	"errors"
	"pittsix/internal/db"
)

type User struct {
	ID           int
	Email        string
	PasswordHash string
}

func CreateUser(email, hash string) error {
	conn := db.MustGetPostgres()
	_, err := conn.Exec("INSERT INTO users (email, password) VALUES ($1, $2)", email, hash)
	if err != nil {
		return err
	}
	return nil
}

func GetUserByEmail(email string) (User, error) {
	conn := db.MustGetPostgres()
	row := conn.QueryRow("SELECT id, email, password FROM users WHERE email=$1", email)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash)
	if err != nil {
		return User{}, errors.New("not found")
	}
	return u, nil
}
