package entity

import (
	"strings"
	"sync"

	"golang.org/x/text/unicode/norm"
)

type Resolver struct {
	mu       sync.Mutex
	seen     map[string]string // canonical -> id
}

func New() *Resolver {
	return &Resolver{seen: make(map[string]string)}
}

func Canonical(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	s = norm.NFC.String(s)
	return s
}

func (r *Resolver) Resolve(value, id string) (string, bool) {
	c := Canonical(value)
	r.mu.Lock()
	defer r.mu.Unlock()
	if existing, ok := r.seen[c]; ok {
		return existing, false // already exists
	}
	r.seen[c] = id
	return id, true
}
