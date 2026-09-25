package registry

import (
	"context"
	"testing"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

type mockProv struct{ id string; types []target.TargetType; fails bool }

func (m *mockProv) ID() string { return m.id }
func (m *mockProv) Name() string { return m.id }
func (m *mockProv) TargetTypes() []target.TargetType { return m.types }
func (m *mockProv) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	if m.fails { return evidence.Evidence{}, context.DeadlineExceeded }
	return evidence.Evidence{Provider: m.id, Status: evidence.StatusFound, Confidence: evidence.ConfidenceWeak, Timestamp: time.Now(), SourceURL: "https://example.com/"+t.Normalized}, nil
}

func TestRegistryForTarget(t *testing.T) {
	r := New()
	_ = r.Register(&mockProv{id: "a", types: []target.TargetType{target.TypeUsername}})
	_ = r.Register(&mockProv{id: "b", types: []target.TargetType{target.TypeEmail}})
	if len(r.ForTarget(target.TypeUsername)) != 1 { t.Errorf("forTarget username") }
	if len(r.List()) != 2 { t.Errorf("list") }
}
