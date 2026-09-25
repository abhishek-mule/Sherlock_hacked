package onion

import (
	"context"
	"os"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

// Provider is gated — only runs when TOR_PROXY env is set and caller passes --tor.
type Provider struct{}

func (p *Provider) ID() string   { return "onion-search" }
func (p *Provider) Name() string { return "Onion Search (gated)" }
func (p *Provider) TargetTypes() []target.TargetType {
	return []target.TargetType{target.TypeUsername, target.TypeDomain, target.TypeURL}
}

func (p *Provider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target: t, Provider: p.ID(), Query: t.Normalized,
		Timestamp: time.Now().UTC(), EvidenceType: "onion", CollectionMethod: "tor_gated",
		SourceURL: "tor://search/" + t.Normalized,
	}
	if os.Getenv("TOR_PROXY") == "" {
		ev.Status = evidence.StatusUnavailable; ev.Confidence = evidence.ConfidenceInconclusive
		msg := "TOR_PROXY not set — onion search disabled (set TOR_PROXY=socks5h://127.0.0.1:9050 and use --tor)"
		ev.Error = &msg
		return ev, nil
	}
	// If enabled, still report gated — full TOR implementation requires socks proxy dialer
	ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
	note := "TOR enabled but onion search requires explicit --tor flag and manual review"
	ev.RawSnippet = &note
	return ev, nil
}
