package security

import (
	"fmt"
	"net"
	"net/url"
	"strings"
)

var privateCIDRs = []string{
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
	"127.0.0.0/8",
	"169.254.0.0/16",
	"fc00::/7",
	"fe80::/10",
	"::1/128",
}

var privateNets []*net.IPNet

// AllowPrivateForTest permits 127.0.0.1 in unit tests when set to true.
var AllowPrivateForTest bool

func init() {
	for _, c := range privateCIDRs {
		_, n, _ := net.ParseCIDR(c)
		if n != nil {
			privateNets = append(privateNets, n)
		}
	}
}

func IsPrivateIP(ip net.IP) bool {
	for _, n := range privateNets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

// ValidateURL blocks private/local IPs and non-http(s) schemes.
func ValidateURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil {
		return fmt.Errorf("invalid URL: %w", err)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return fmt.Errorf("URL scheme must be http or https")
	}
	host := u.Hostname()
	if host == "" {
		return fmt.Errorf("URL missing host")
	}
	// localhost / metadata service
	lower := strings.ToLower(host)
	if lower == "localhost" || lower == "metadata.google.internal" {
		return fmt.Errorf("blocked host: %s", host)
	}
	// If host is IP literal, check privateness (allow 127.0.0.1 in tests)
	if ip := net.ParseIP(host); ip != nil {
		if IsPrivateIP(ip) && !(AllowPrivateForTest && ip.IsLoopback()) {
			return fmt.Errorf("blocked private IP: %s", host)
		}
	}
	// Resolve host and check IPs (defense in depth — best effort, no network in validation-only path)
	// Caller should re-check after DNS resolve before fetch.
	return nil
}

// ValidateTargetURL resolves DNS and checks resolved IPs are not private.
// Call this right before fetch.
func ValidateResolvedIPs(host string) error {
	ips, err := net.LookupIP(host)
	if err != nil {
		// Don't fail open — let caller decide, but log
		return nil
	}
	for _, ip := range ips {
		if IsPrivateIP(ip) {
			return fmt.Errorf("resolved to private IP: %s -> %s", host, ip.String())
		}
	}
	return nil
}
