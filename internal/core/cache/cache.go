package cache

import (
	"sync"
	"time"
)

type entry struct {
	val      string
	expireAt time.Time
}

type Cache struct {
	mu   sync.RWMutex
	data map[string]entry
}

func New() *Cache {
	return &Cache{data: make(map[string]entry)}
}

func (c *Cache) Get(key string) (string, bool) {
	c.mu.RLock()
	e, ok := c.data[key]
	c.mu.RUnlock()
	if !ok {
		return "", false
	}
	if time.Now().After(e.expireAt) {
		c.mu.Lock()
		delete(c.data, key)
		c.mu.Unlock()
		return "", false
	}
	return e.val, true
}

func (c *Cache) Set(key, val string, ttl time.Duration) {
	c.mu.Lock()
	c.data[key] = entry{val: val, expireAt: time.Now().Add(ttl)}
	c.mu.Unlock()
}

func (c *Cache) Delete(key string) {
	c.mu.Lock()
	delete(c.data, key)
	c.mu.Unlock()
}
