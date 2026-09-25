package discovery

import (
	"context"
	"fmt"
	"sync"
	"time"

	"golang.org/x/sync/errgroup"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/cache"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/registry"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

type Engine struct {
	registry    *registry.Registry
	concurrency int
	timeout     time.Duration
	cache       *cache.Cache
}

func New(reg *registry.Registry, concurrency int, timeout time.Duration) *Engine {
	if concurrency <= 0 {
		concurrency = 5
	}
	if timeout <= 0 {
		timeout = 8 * time.Second
	}
	return &Engine{registry: reg, concurrency: concurrency, timeout: timeout, cache: cache.New()}
}

// NewWithCache allows sharing cache (e.g., provider_cache table could back it)
func NewWithCache(reg *registry.Registry, concurrency int, timeout time.Duration, c *cache.Cache) *Engine {
	if c == nil {
		c = cache.New()
	}
	if concurrency <= 0 {
		concurrency = 5
	}
	if timeout <= 0 {
		timeout = 8 * time.Second
	}
	return &Engine{registry: reg, concurrency: concurrency, timeout: timeout, cache: c}
}

type Result struct {
	Evidence evidence.Evidence
	Error    error
}

// Investigate runs all providers matching target type with bounded concurrency.
// A single provider failure never aborts the investigation.
func (e *Engine) Investigate(ctx context.Context, t target.Target) []Result {
	providers := e.registry.ForTarget(t.Type)
	if len(providers) == 0 {
		return nil
	}

	sem := make(chan struct{}, e.concurrency)
	var mu sync.Mutex
	var results []Result

	g, ctx := errgroup.WithContext(ctx)

	for _, p := range providers {
		p := p
		g.Go(func() error {
			sem <- struct{}{}
			defer func() { <-sem }()

			// Cache key: provider + normalized target
			cacheKey := fmt.Sprintf("%s:%s", p.ID(), t.Normalized)
			if cached, ok := e.cache.Get(cacheKey); ok && cached != "" {
				ev := evidence.Evidence{
					Target: t, Provider: p.ID(), Query: t.Normalized,
					Status: evidence.Status(cached), Confidence: evidence.ConfidenceInconclusive,
					Timestamp: time.Now().UTC(), SourceURL: "cache://" + cacheKey,
					EvidenceType: "cached", CollectionMethod: "cache",
				}
				mu.Lock()
				results = append(results, Result{Evidence: ev})
				mu.Unlock()
				return nil
			}

			pCtx, cancel := context.WithTimeout(ctx, e.timeout)
			defer cancel()

			var ev evidence.Evidence
			var err error
			// Retry with exponential backoff for transient errors
			for attempt := 0; attempt < 3; attempt++ {
				ev, err = p.Check(pCtx, t)
				if err == nil && ev.Status != evidence.StatusUnavailable && ev.Status != evidence.StatusError {
					break
				}
				if attempt < 2 {
					backoff := time.Duration(100*(1<<attempt)) * time.Millisecond
					select {
					case <-time.After(backoff):
					case <-pCtx.Done():
						break
					}
				}
			}
			// Normalize error into evidence if needed
			if err != nil {
				msg := err.Error()
				ev = evidence.Evidence{
					Target:           t,
					Provider:         p.ID(),
					Query:            t.Normalized,
					Status:           evidence.StatusError,
					Confidence:       evidence.ConfidenceInconclusive,
					Timestamp:        time.Now().UTC(),
					CollectionMethod: "provider_check",
					Error:            &msg,
				}
			}
			if ev.Timestamp.IsZero() {
				ev.Timestamp = time.Now().UTC()
			}
			// Populate cache (TTL 1h)
			e.cache.Set(cacheKey, string(ev.Status), time.Hour)
			mu.Lock()
			results = append(results, Result{Evidence: ev, Error: err})
			mu.Unlock()
			return nil // never fail the group
		})
	}
	_ = g.Wait()
	return results
}
