package limiter

import (
	"sync"

	"golang.org/x/time/rate"
)

type Manager struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
	r        rate.Limit
	burst    int
}

func New(r rate.Limit, burst int) *Manager {
	return &Manager{
		limiters: make(map[string]*rate.Limiter),
		r:        r,
		burst:    burst,
	}
}

func (m *Manager) ForHost(host string) *rate.Limiter {
	m.mu.Lock()
	defer m.mu.Unlock()
	if l, ok := m.limiters[host]; ok {
		return l
	}
	l := rate.NewLimiter(m.r, m.burst)
	m.limiters[host] = l
	return l
}
