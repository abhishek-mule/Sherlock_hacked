package domain

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/security"
)

type RDAPProvider struct{}

func (p *RDAPProvider) ID() string   { return "rdap" }
func (p *RDAPProvider) Name() string { return "RDAP (domain)" }
func (p *RDAPProvider) TargetTypes() []target.TargetType { return []target.TargetType{target.TypeDomain} }

func (p *RDAPProvider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target: t, Provider: p.ID(), Query: t.Normalized,
		Timestamp: time.Now().UTC(), EvidenceType: "whois", CollectionMethod: "rdap",
		SourceURL: "https://rdap.org/domain/" + t.Normalized,
	}
	if err := security.ValidateURL(ev.SourceURL); err != nil {
		msg := err.Error()
		ev.Status = evidence.StatusBlocked; ev.Confidence = evidence.ConfidenceInconclusive; ev.Error = &msg
		return ev, nil
	}
	// Also try DNS as evidence of existence (no PII leakage)
	if _, err := net.DefaultResolver.LookupHost(ctx, t.Normalized); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "no such host") {
			ev.Status = evidence.StatusNotFound; ev.Confidence = evidence.ConfidenceNegative
			return ev, nil
		}
		ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
		msg := err.Error(); ev.Error = &msg
		return ev, nil
	}
	// DNS resolved — try RDAP for metadata
	req, _ := http.NewRequestWithContext(ctx, "GET", ev.SourceURL, nil)
	req.Header.Set("Accept", "application/rdap+json")
	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		// DNS succeeded so domain exists at least
		ev.Status = evidence.StatusFound; ev.Confidence = evidence.ConfidenceWeak
		ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
		return ev, nil
	}
	defer resp.Body.Close()
	if resp.StatusCode == 404 {
		ev.Status = evidence.StatusNotFound; ev.Confidence = evidence.ConfidenceNegative
		return ev, nil
	}
	if resp.StatusCode == 429 {
		ev.Status = evidence.StatusRateLimited; ev.Confidence = evidence.ConfidenceInconclusive
		return ev, nil
	}
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 256*1024))
	var data map[string]interface{}
	if json.Unmarshal(body, &data) == nil {
		if _, ok := data["ldhName"]; ok {
			ev.Status = evidence.StatusFound; ev.Confidence = evidence.ConfidenceStrong
			ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
			snip := string(body[:min(400, len(body))]); ev.RawSnippet = &snip
			return ev, nil
		}
	}
	// Fallback: DNS resolved → weak found
	ev.Status = evidence.StatusFound; ev.Confidence = evidence.ConfidenceWeak
	ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
	if len(body) > 0 {
		s := string(body[:min(400, len(body))]); ev.RawSnippet = &s
	}
	_ = fmt.Sprintf
	return ev, nil
}

func min(a, b int) int { if a < b { return a }; return b }
