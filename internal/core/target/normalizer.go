package target

import (
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"regexp"
	"strings"
)

type TargetType string

const (
	TypeUsername TargetType = "username"
	TypeEmail    TargetType = "email"
	TypePhone    TargetType = "phone"
	TypeDomain   TargetType = "domain"
	TypeIP       TargetType = "ip"
	TypeURL      TargetType = "url"
	TypeCrypto   TargetType = "crypto"
)

type Target struct {
	Raw        string     `json:"raw"`
	Normalized string     `json:"normalized"`
	Type       TargetType `json:"type"`
}

var (
	usernameRe = regexp.MustCompile(`^[a-zA-Z0-9._-]{3,30}$`)
	phoneRe    = regexp.MustCompile(`^\+?[0-9]{7,15}$`)
)

func Normalize(raw string, typ TargetType) (Target, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return Target{}, fmt.Errorf("empty target")
	}
	switch typ {
	case TypeEmail:
		addr, err := mail.ParseAddress(raw)
		if err != nil {
			return Target{}, fmt.Errorf("invalid email: %w", err)
		}
		norm := strings.ToLower(strings.TrimSpace(addr.Address))
		parts := strings.Split(norm, "@")
		if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
			return Target{}, fmt.Errorf("invalid email")
		}
		return Target{Raw: raw, Normalized: norm, Type: typ}, nil
	case TypeUsername:
		// normalize: trim, lower
		norm := strings.ToLower(raw)
		if !usernameRe.MatchString(norm) {
			return Target{}, fmt.Errorf("invalid username: must match %s", usernameRe.String())
		}
		return Target{Raw: raw, Normalized: norm, Type: typ}, nil
	case TypePhone:
		// strip spaces, dashes, parentheses
		norm := regexp.MustCompile(`[\s\-\(\)]`).ReplaceAllString(raw, "")
		if !phoneRe.MatchString(norm) {
			return Target{}, fmt.Errorf("invalid phone: must be E.164-like")
		}
		if !strings.HasPrefix(norm, "+") {
			norm = "+" + norm
		}
		return Target{Raw: raw, Normalized: norm, Type: typ}, nil
	case TypeDomain:
		rawLower := strings.ToLower(raw)
		rawLower = strings.TrimPrefix(rawLower, "http://")
		rawLower = strings.TrimPrefix(rawLower, "https://")
		rawLower = strings.Split(rawLower, "/")[0]
		rawLower = strings.TrimSuffix(rawLower, ".")
		if len(rawLower) < 1 || len(rawLower) > 253 {
			return Target{}, fmt.Errorf("invalid domain length")
		}
		if !strings.Contains(rawLower, ".") {
			return Target{}, fmt.Errorf("invalid domain: missing TLD")
		}
		return Target{Raw: raw, Normalized: rawLower, Type: typ}, nil
	case TypeIP:
		ip := net.ParseIP(strings.TrimSpace(raw))
		if ip == nil {
			return Target{}, fmt.Errorf("invalid IP")
		}
		return Target{Raw: raw, Normalized: ip.String(), Type: typ}, nil
	case TypeURL:
		u, err := url.Parse(strings.TrimSpace(raw))
		if err != nil || u.Scheme == "" || u.Host == "" {
			return Target{}, fmt.Errorf("invalid URL")
		}
		if u.Scheme != "http" && u.Scheme != "https" {
			return Target{}, fmt.Errorf("URL scheme must be http or https")
		}
		return Target{Raw: raw, Normalized: u.String(), Type: typ}, nil
	case TypeCrypto:
		norm := strings.TrimSpace(raw)
		if len(norm) < 26 || len(norm) > 64 {
			return Target{}, fmt.Errorf("invalid crypto address length")
		}
		return Target{Raw: raw, Normalized: norm, Type: typ}, nil
	default:
		return Target{}, fmt.Errorf("unknown target type: %s", typ)
	}
}

// AutoDetect tries to infer type from raw string.
func AutoDetect(raw string) (TargetType, bool) {
	raw = strings.TrimSpace(raw)
	if _, err := mail.ParseAddress(raw); err == nil && strings.Contains(raw, "@") {
		return TypeEmail, true
	}
	if _, err := url.ParseRequestURI(raw); err == nil && (strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://")) {
		return TypeURL, true
	}
	if net.ParseIP(raw) != nil {
		return TypeIP, true
	}
	if phoneRe.MatchString(regexp.MustCompile(`[\s\-\(\)]`).ReplaceAllString(raw, "")) && strings.ContainsAny(raw, "+0123456789") && len(raw) >= 7 {
		// heuristic: prefer phone if starts with + or is all digits with length
		s := regexp.MustCompile(`[\s\-\(\)\+]`).ReplaceAllString(raw, "")
		if len(s) >= 7 && len(s) <= 15 && regexp.MustCompile(`^[0-9]+$`).MatchString(s) {
			return TypePhone, true
		}
	}
	if strings.Contains(raw, ".") && !strings.Contains(raw, " ") && !strings.Contains(raw, "@") {
		return TypeDomain, true
	}
	if usernameRe.MatchString(strings.ToLower(raw)) {
		return TypeUsername, true
	}
	return "", false
}
