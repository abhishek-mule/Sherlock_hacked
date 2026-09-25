package crypto

import (
	"context"
	"strings"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

type Provider struct{}

func (p *Provider) ID() string   { return "crypto-format" }
func (p *Provider) Name() string { return "Crypto (format check)" }
func (p *Provider) TargetTypes() []target.TargetType { return []target.TargetType{target.TypeCrypto} }

func (p *Provider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target: t, Provider: p.ID(), Query: t.Normalized,
		Timestamp: time.Now().UTC(), EvidenceType: "crypto", CollectionMethod: "format_validation",
		SourceURL: "local://crypto-format/" + t.Normalized,
	}
	n := t.Normalized
	if strings.HasPrefix(n, "1") || strings.HasPrefix(n, "3") || strings.HasPrefix(n, "bc1") || strings.HasPrefix(n, "0x") {
		ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
		note := "format plausible — on-chain lookup not performed (requires external API)"
		ev.RawSnippet = &note
		ov := n; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
		return ev, nil
	}
	ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
	return ev, nil
}
