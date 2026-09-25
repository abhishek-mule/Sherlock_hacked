package config

import (
	"os"
	"strings"
)

func Get(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func DatabaseURL() string {
	v := Get("DATABASE_URL", "sqlite://./data/sherlock.db")
	v = strings.TrimSpace(v)
	if v == "" {
		return "sqlite://./data/sherlock.db"
	}
	return v
}

func IsPrivateImportAllowed() bool {
	return strings.EqualFold(Get("ALLOW_PRIVATE_IMPORT", ""), "1") ||
		strings.EqualFold(Get("ALLOW_PRIVATE_IMPORT", ""), "true")
}
