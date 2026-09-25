package urlprov

import (
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/security"
)

type MetadataProvider struct{}

func (p *MetadataProvider) ID() string   { return "url-metadata" }
func (p *MetadataProvider) Name() string { return "URL Metadata" }
func (p *MetadataProvider) TargetTypes() []target.TargetType { return []target.TargetType{target.TypeURL} }

func (p *MetadataProvider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target: t, Provider: p.ID(), Query: t.Normalized,
		Timestamp: time.Now().UTC(), EvidenceType: "url", CollectionMethod: "http_head",
		SourceURL: t.Normalized,
	}
	if err := security.ValidateURL(t.Normalized); err != nil {
		msg := err.Error()
		ev.Status = evidence.StatusBlocked; ev.Confidence = evidence.ConfidenceInconclusive; ev.Error = &msg
		return ev, nil
	}
	req, _ := http.NewRequestWithContext(ctx, "HEAD", t.Normalized, nil)
	req.Header.Set("User-Agent", "SherlockHacked/1.0")
	client := &http.Client{Timeout: 6 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) >= 3 { return http.ErrUseLastResponse }
		return nil
	}}
	resp, err := client.Do(req)
	if err != nil {
		msg := err.Error(); ev.Status = evidence.StatusUnavailable; ev.Confidence = evidence.ConfidenceInconclusive; ev.Error = &msg
		return ev, nil
	}
	defer resp.Body.Close()
	if resp.StatusCode == 429 { ev.Status = evidence.StatusRateLimited; ev.Confidence = evidence.ConfidenceInconclusive; return ev, nil }
	if resp.StatusCode == 403 { ev.Status = evidence.StatusBlocked; ev.Confidence = evidence.ConfidenceInconclusive; return ev, nil }
	if resp.StatusCode == 404 { ev.Status = evidence.StatusNotFound; ev.Confidence = evidence.ConfidenceNegative; return ev, nil }
	if resp.StatusCode >= 200 && resp.StatusCode < 400 {
		// Try to get title via GET if HEAD gave little
		if ct := resp.Header.Get("Content-Type"); strings.Contains(ct, "text/html") {
			// quick GET for snippet
			req2, _ := http.NewRequestWithContext(ctx, "GET", t.Normalized, nil)
			if r2, err := client.Do(req2); err == nil {
				defer r2.Body.Close()
				b, _ := io.ReadAll(io.LimitReader(r2.Body, 20*1024))
				s := string(b[:min(500, len(b))]); ev.RawSnippet = &s
			}
		}
		ev.Status = evidence.StatusFound; ev.Confidence = evidence.ConfidenceWeak
		ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
		return ev, nil
	}
	ev.Status = evidence.StatusInconclusive; ev.Confidence = evidence.ConfidenceAmbiguous
	return ev, nil
}

func min(a, b int) int { if a < b { return a }; return b }
