package discovery

import (
	"context"
	"testing"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/registry"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

type okProv struct{ id string }
func (o *okProv) ID() string { return o.id }
func (o *okProv) Name() string { return o.id }
func (o *okProv) TargetTypes() []target.TargetType { return []target.TargetType{target.TypeUsername} }
func (o *okProv) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	return evidence.Evidence{Provider: o.id, Status: evidence.StatusFound, Confidence: evidence.ConfidenceWeak, Timestamp: time.Now()}, nil
}
type errProv struct{ id string }
func (e *errProv) ID() string { return e.id }
func (e *errProv) Name() string { return e.id }
func (e *errProv) TargetTypes() []target.TargetType { return []target.TargetType{target.TypeUsername} }
func (e *errProv) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	return evidence.Evidence{}, context.DeadlineExceeded
}

func TestInvestigateIsolation(t *testing.T) {
	r := registry.New()
	_ = r.Register(&okProv{id: "good"})
	_ = r.Register(&errProv{id: "bad"})
	eng := New(r, 5, 2*time.Second)
	tg := target.Target{Raw: "johndoe", Normalized: "johndoe", Type: target.TypeUsername}
	results := eng.Investigate(context.Background(), tg)
	if len(results) != 2 { t.Fatalf("want 2 results got %d", len(results)) }
	// one should be FOUND, one ERROR — but investigation not crashed
	var found, errCount int
	for _, r := range results {
		if r.Evidence.Status == evidence.StatusFound { found++ }
		if r.Evidence.Status == evidence.StatusError { errCount++ }
	}
	if found != 1 || errCount != 1 { t.Errorf("isolation failed found=%d err=%d", found, errCount) }
}
