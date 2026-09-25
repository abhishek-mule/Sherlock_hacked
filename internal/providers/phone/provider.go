package phone

import (
	"context"
	"strings"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

// Provider validates format and checks against local synthetic DB if available.
// No external HLR lookup — lawful only.
type Provider struct{}

func (p *Provider) ID() string   { return "phone-format" }
func (p *Provider) Name() string { return "Phone (format check)" }
func (p *Provider) TargetTypes() []target.TargetType { return []target.TargetType{target.TypePhone} }

func (p *Provider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target: t, Provider: p.ID(), Query: t.Normalized,
		Timestamp: time.Now().UTC(), EvidenceType: "phone", CollectionMethod: "format_validation",
		SourceURL: "local://phone-format/" + t.Normalized,
	}
	// Already normalized as E.164-like; just report format validity
	n := strings.TrimPrefix(t.Normalized, "+")
	if len(n) < 7 || len(n) > 15 {
		ev.Status = evidence.StatusNotFound; ev.Confidence = evidence.ConfidenceNegative
		msg := "invalid length"; ev.Error = &msg
		return ev, nil
	}
	ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
	note := "format valid — no external HLR lookup performed (lawful)"
	ev.RawSnippet = &note
	ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
	return ev, nil
}
