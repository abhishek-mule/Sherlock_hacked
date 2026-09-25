package providers

import (
	"golang.org/x/time/rate"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/registry"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/providers/base"
)

// DefaultRegistry returns a registry with built-in providers (inspired by holehe/user-scanner ideas, not copied).
func DefaultRegistry() *registry.Registry {
	r := registry.New()
	lim := rate.NewLimiter(rate.Limit(1), 2) // 1 req/s per host, burst 2

	_ = r.Register(&base.HttpProvider{
		IDField: "github", NameField: "GitHub",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: "https://github.com/{username}",
		SuccessContains: "joined GitHub", // heuristic — refined via testing
		NotFoundContains: "404",
		Limiter: lim,
	})
	_ = r.Register(&base.HttpProvider{
		IDField: "reddit", NameField: "Reddit",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: "https://www.reddit.com/user/{username}/",
		NotFoundContains: "nobody on Reddit",
		Limiter: lim,
	})
	_ = r.Register(&base.HttpProvider{
		IDField: "npm", NameField: "npm",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: "https://www.npmjs.com/~{username}",
		NotFoundContains: "404",
		Limiter: lim,
	})
	_ = r.Register(&base.HttpProvider{
		IDField: "hackernews", NameField: "HackerNews",
		TargetTypesField: []target.TargetType{target.TypeUsername},
		URLTemplate: "https://news.ycombinator.com/user?id={username}",
		Limiter: lim,
	})
	_ = r.Register(&base.HttpProvider{
		IDField: "gravatar", NameField: "Gravatar",
		TargetTypesField: []target.TargetType{target.TypeEmail},
		URLTemplate: "https://en.gravatar.com/{email}",
		Limiter: lim,
	})
	_ = r.Register(&base.HttpProvider{
		IDField: "github-email", NameField: "GitHub (email hint)",
		TargetTypesField: []target.TargetType{target.TypeEmail},
		URLTemplate: "https://github.com/search?q={email}&type=users",
		Limiter: lim,
	})
	return r
}
