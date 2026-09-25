package registry

import (
	"context"
	"fmt"
	"sort"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

// Provider is the contract every OSINT module must satisfy.
type Provider interface {
	ID() string
	Name() string
	TargetTypes() []target.TargetType
	Check(ctx context.Context, t target.Target) (evidence.Evidence, error)
}

type Registry struct {
	providers map[string]Provider
}

func New() *Registry {
	return &Registry{providers: make(map[string]Provider)}
}

func (r *Registry) Register(p Provider) error {
	if p == nil {
		return fmt.Errorf("nil provider")
	}
	if _, exists := r.providers[p.ID()]; exists {
		return fmt.Errorf("provider %s already registered", p.ID())
	}
	r.providers[p.ID()] = p
	return nil
}

func (r *Registry) Get(id string) (Provider, bool) {
	p, ok := r.providers[id]
	return p, ok
}

func (r *Registry) List() []Provider {
	out := make([]Provider, 0, len(r.providers))
	for _, p := range r.providers {
		out = append(out, p)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID() < out[j].ID() })
	return out
}

func (r *Registry) ForTarget(t target.TargetType) []Provider {
	var out []Provider
	for _, p := range r.providers {
		for _, tt := range p.TargetTypes() {
			if tt == t {
				out = append(out, p)
				break
			}
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID() < out[j].ID() })
	return out
}

func (r *Registry) IDs() []string {
	ids := make([]string, 0, len(r.providers))
	for k := range r.providers {
		ids = append(ids, k)
	}
	sort.Strings(ids)
	return ids
}
