package base

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"golang.org/x/time/rate"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/security"
)

type HttpProvider struct {
	IDField          string
	NameField        string
	TargetTypesField []target.TargetType
	URLTemplate      string // e.g. https://github.com/{username}
	Method           string
	SuccessContains  string // if body contains this, FOUND
	NotFoundContains string // if body contains this, NOT_FOUND
	Timeout          time.Duration
	Limiter          *rate.Limiter
}

func (p *HttpProvider) ID() string                      { return p.IDField }
func (p *HttpProvider) Name() string                    { return p.NameField }
func (p *HttpProvider) TargetTypes() []target.TargetType { return p.TargetTypesField }

func (p *HttpProvider) Check(ctx context.Context, t target.Target) (evidence.Evidence, error) {
	ev := evidence.Evidence{
		Target:           t,
		Provider:         p.IDField,
		Query:            t.Normalized,
		Timestamp:        time.Now().UTC(),
		CollectionMethod: "http_get",
		EvidenceType:     "profile_url",
	}
	rawURL := strings.ReplaceAll(p.URLTemplate, "{username}", url.PathEscape(t.Normalized))
	rawURL = strings.ReplaceAll(rawURL, "{target}", url.PathEscape(t.Normalized))
	rawURL = strings.ReplaceAll(rawURL, "{email}", url.PathEscape(t.Normalized))
	ev.SourceURL = rawURL

	if err := security.ValidateURL(rawURL); err != nil {
		msg := err.Error()
		ev.Status = evidence.StatusBlocked
		ev.Confidence = evidence.ConfidenceInconclusive
		ev.Error = &msg
		return ev, nil
	}
	if p.Limiter != nil {
		if err := p.Limiter.Wait(ctx); err != nil {
			msg := err.Error()
			ev.Status = evidence.StatusRateLimited
			ev.Confidence = evidence.ConfidenceInconclusive
			ev.Error = &msg
			return ev, nil
		}
	}
	method := p.Method
	if method == "" {
		method = http.MethodGet
	}
	req, err := http.NewRequestWithContext(ctx, method, rawURL, nil)
	if err != nil {
		msg := err.Error()
		ev.Status = evidence.StatusError
		ev.Confidence = evidence.ConfidenceInconclusive
		ev.Error = &msg
		return ev, nil
	}
	req.Header.Set("User-Agent", "SherlockHacked/1.0 (+https://github.com/abhishek-mule/Sherlock_hacked)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	client := &http.Client{
		Timeout: 8 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}
	resp, err := client.Do(req)
	if err != nil {
		msg := err.Error()
		ev.Status = evidence.StatusUnavailable
		ev.Confidence = evidence.ConfidenceInconclusive
		ev.Error = &msg
		return ev, nil
	}
	defer resp.Body.Close()

	// Handle status codes explicitly — do not treat no result as proof
	switch resp.StatusCode {
	case 429:
		ev.Status = evidence.StatusRateLimited
		ev.Confidence = evidence.ConfidenceInconclusive
		return ev, nil
	case 403:
		ev.Status = evidence.StatusBlocked
		ev.Confidence = evidence.ConfidenceInconclusive
		return ev, nil
	case 404:
		ev.Status = evidence.StatusNotFound
		ev.Confidence = evidence.ConfidenceNegative
		return ev, nil
	case 500, 502, 503, 504:
		msg := fmt.Sprintf("upstream %d", resp.StatusCode)
		ev.Status = evidence.StatusUnavailable
		ev.Confidence = evidence.ConfidenceInconclusive
		ev.Error = &msg
		return ev, nil
	}

	// Read limited body
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 512*1024))
	bs := string(body)
	snip := bs
	if len(snip) > 500 {
		snip = snip[:500]
	}
	ev.RawSnippet = &snip

	// Exponential-backoff style confidence: check signals
	lower := strings.ToLower(bs)
	if p.NotFoundContains != "" && strings.Contains(lower, strings.ToLower(p.NotFoundContains)) {
		ev.Status = evidence.StatusNotFound
		ev.Confidence = evidence.ConfidenceNegative
		return ev, nil
	}
	if p.SuccessContains != "" && strings.Contains(lower, strings.ToLower(p.SuccessContains)) {
		ev.Status = evidence.StatusFound
		ev.Confidence = evidence.ConfidenceWeak
		ov := t.Normalized
		ev.ObservedValue = &ov
		ev.NormalizedValue = &ov
		return ev, nil
	}
	// Heuristic: GitHub 200 with profile header strongly indicates FOUND
	if strings.Contains(lower, "profile") && strings.Contains(lower, t.Normalized) {
		ev.Status = evidence.StatusFound
		ev.Confidence = evidence.ConfidenceWeak
		ov := t.Normalized; ev.ObservedValue = &ov; ev.NormalizedValue = &ov
		return ev, nil
	}
	if resp.StatusCode == 200 {
		ev.Status = evidence.StatusInconclusive
		ev.Confidence = evidence.ConfidenceAmbiguous
		return ev, nil
	}
	ev.Status = evidence.StatusInconclusive
	ev.Confidence = evidence.ConfidenceInconclusive
	return ev, nil
}
