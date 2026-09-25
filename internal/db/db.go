package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	SQL *sql.DB
	Path string
}

func Open(path string) (*DB, error) {
	if strings.HasPrefix(path, "sqlite://") {
		path = strings.TrimPrefix(path, "sqlite://")
	}
	if path == "" {
		path = "./data/sherlock.db"
	}
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("mkdir data dir: %w", err)
	}
	sqlDB, err := sql.Open("sqlite3", path+"?_journal_mode=WAL&_foreign_keys=on")
	if err != nil {
		return nil, err
	}
	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}
	m := &DB{SQL: sqlDB, Path: path}
	if err := m.Migrate(); err != nil {
		return nil, err
	}
	return m, nil
}

func (d *DB) Close() error {
	if d.SQL != nil {
		return d.SQL.Close()
	}
	return nil
}

func (d *DB) Migrate() error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))`,
		`CREATE TABLE IF NOT EXISTS investigations (
			id TEXT PRIMARY KEY,
			target_raw TEXT NOT NULL,
			target_normalized TEXT NOT NULL,
			target_type TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'completed',
			created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
			completed_at TEXT
		)`,
		`CREATE INDEX IF NOT EXISTS idx_investigations_target ON investigations(target_normalized)`,
		`CREATE TABLE IF NOT EXISTS observations (
			id TEXT PRIMARY KEY,
			investigation_id TEXT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
			provider TEXT NOT NULL,
			query TEXT NOT NULL,
			observed_value TEXT,
			normalized_value TEXT,
			status TEXT NOT NULL,
			confidence TEXT NOT NULL,
			source_url TEXT,
			evidence_type TEXT,
			collection_method TEXT,
			raw_snippet TEXT,
			error TEXT,
			collected_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_observations_investigation ON observations(investigation_id)`,
		`CREATE INDEX IF NOT EXISTS idx_observations_provider ON observations(provider)`,
		`CREATE INDEX IF NOT EXISTS idx_observations_status ON observations(status)`,
		`CREATE TABLE IF NOT EXISTS entities (
			id TEXT PRIMARY KEY,
			canonical_value TEXT NOT NULL UNIQUE,
			type TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
		)`,
		`CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(canonical_value, type, content='entities', content_rowid='rowid')`,
		`CREATE TABLE IF NOT EXISTS provider_cache (
			key TEXT PRIMARY KEY,
			response TEXT NOT NULL,
			created_at TEXT NOT NULL,
			ttl_seconds INTEGER NOT NULL DEFAULT 3600
		)`,
		// Local imported data (synthetic by default)
		`CREATE TABLE IF NOT EXISTS admission_data (
			sr_no INTEGER PRIMARY KEY,
			merit_no INTEGER,
			full_name TEXT,
			branch TEXT,
			college TEXT,
			city TEXT,
			status TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS osint_data (
			sr_no INTEGER PRIMARY KEY,
			student_name TEXT,
			github TEXT,
			skills TEXT,
			location TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS student_data_synthetic (
			sr_no INTEGER PRIMARY KEY,
			name TEXT,
			email TEXT,
			branch TEXT,
			city TEXT
		)`,
	}
	for _, s := range stmts {
		if _, err := d.SQL.Exec(s); err != nil {
			if strings.Contains(s, "VIRTUAL TABLE") {
				if strings.Contains(err.Error(), "already exists") {
					continue
				}
				if strings.Contains(err.Error(), "no such module: fts5") {
					// Fallback: create plain FTS table without FTS5 (LIKE queries still work)
					_, _ = d.SQL.Exec(`CREATE TABLE IF NOT EXISTS entities_fts (canonical_value TEXT, type TEXT)`)
					continue
				}
			}
			return fmt.Errorf("migrate exec failed: %w\nSQL: %s", err, s)
		}
	}
	return nil
}

// Status returns counts for UI.
type Status struct {
	Path              string `json:"path"`
	Investigations    int    `json:"investigations"`
	Observations      int    `json:"observations"`
	AdmissionRows     int    `json:"admission_rows"`
	OsintRows         int    `json:"osint_rows"`
	SyntheticRows     int    `json:"synthetic_rows"`
}

func (d *DB) Status() (Status, error) {
	s := Status{Path: d.Path}
	queries := map[string]*int{
		`SELECT COUNT(*) FROM investigations`:          &s.Investigations,
		`SELECT COUNT(*) FROM observations`:            &s.Observations,
		`SELECT COUNT(*) FROM admission_data`:          &s.AdmissionRows,
		`SELECT COUNT(*) FROM osint_data`:              &s.OsintRows,
		`SELECT COUNT(*) FROM student_data_synthetic`: &s.SyntheticRows,
	}
	for q, ptr := range queries {
		if err := d.SQL.QueryRow(q).Scan(ptr); err != nil {
			return s, err
		}
	}
	return s, nil
}
