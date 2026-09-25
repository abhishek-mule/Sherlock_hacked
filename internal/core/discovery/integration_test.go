package discovery

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/registry"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/providers/base"
	"github.com/abhishek-mule/Sherlock_hacked/internal/security"
	"golang.org/x/time/rate"
)

func TestIntegrationWithMockServers(t *testing.T) {
	security.AllowPrivateForTest = true
	defer func() { security.AllowPrivateForTest = false }()
	srvFound := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("profile found for testuser"))
	}))
	defer srvFound.Close()
	srvNotFound := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
	}))
	defer srvNotFound.Close()

	reg := registry.New()
	lim := rate.NewLimiter(10, 5)
	_ = reg.Register(&base.HttpProvider{
		IDField: "mock-found", NameField: "MockFound",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: srvFound.URL + "/{username}",
		SuccessContains: "profile found",
		Limiter: lim,
	})
	_ = reg.Register(&base.HttpProvider{
		IDField: "mock-notfound", NameField: "MockNotFound",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: srvNotFound.URL + "/{username}",
		Limiter: lim,
	})
	eng := New(reg, 2, 2*time.Second)
	tgt := target.Target{Raw: "testuser", Normalized: "testuser", Type: target.TypeUsername}
	results := eng.Investigate(context.Background(), tgt)
	if len(results) != 2 {
		t.Fatalf("want 2 results got %d", len(results))
	}
	m := map[string]string{}
	for _, r := range results {
		m[r.Evidence.Provider] = string(r.Evidence.Status)
	}
	if m["mock-found"] != "FOUND" {
		t.Errorf("mock-found status %q", m["mock-found"])
	}
	if m["mock-notfound"] != "NOT_FOUND" {
		t.Errorf("mock-notfound status %q", m["mock-notfound"])
	}
}
