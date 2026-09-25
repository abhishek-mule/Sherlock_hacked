package security

import "testing"

func TestValidateURL(t *testing.T) {
	if err := ValidateURL("http://localhost/admin"); err == nil { t.Errorf("should block localhost") }
	if err := ValidateURL("https://example.com/profile"); err != nil { t.Errorf("should allow public %v", err) }
	if err := ValidateURL("ftp://example.com"); err == nil { t.Errorf("should block ftp") }
}
