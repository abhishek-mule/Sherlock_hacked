package target

import "testing"

func TestNormalize(t *testing.T) {
	tests := []struct {
		raw string; typ TargetType; want string; wantErr bool
	}{
		{"johndoe", TypeUsername, "johndoe", false},
		{"Jo", TypeUsername, "", true},
		{"user@example.com", TypeEmail, "user@example.com", false},
		{"USER@EXAMPLE.COM", TypeEmail, "user@example.com", false},
		{"bademail", TypeEmail, "", true},
		{"+919876543210", TypePhone, "+919876543210", false},
		{"example.com", TypeDomain, "example.com", false},
		{"https://example.com/path", TypeURL, "https://example.com/path", false},
		{"8.8.8.8", TypeIP, "8.8.8.8", false},
	}
	for _, tc := range tests {
		got, err := Normalize(tc.raw, tc.typ)
		if tc.wantErr && err == nil { t.Errorf("Normalize(%q,%s) want err", tc.raw, tc.typ) }
		if !tc.wantErr && err != nil { t.Errorf("Normalize(%q,%s) err=%v", tc.raw, tc.typ, err) }
		if !tc.wantErr && got.Normalized != tc.want { t.Errorf("Normalize(%q) got %q want %q", tc.raw, got.Normalized, tc.want) }
	}
}

func TestAutoDetect(t *testing.T) {
	if typ, ok := AutoDetect("user@example.com"); !ok || typ != TypeEmail { t.Errorf("auto email failed") }
	if typ, ok := AutoDetect("https://example.com"); !ok || typ != TypeURL { t.Errorf("auto url failed") }
}
