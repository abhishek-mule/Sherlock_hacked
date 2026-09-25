package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/abhishek-mule/Sherlock_hacked/internal/config"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/discovery"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/db"
	imp "github.com/abhishek-mule/Sherlock_hacked/internal/import"
	"github.com/abhishek-mule/Sherlock_hacked/internal/providers"
)

// App is bound to Wails frontend via wailsjs.
type App struct {
	ctx context.Context
	db  *db.DB
}

func NewApp() *App { return &App{} }

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	d, err := db.Open(config.DatabaseURL())
	if err == nil {
		a.db = d
	}
}

func (a *App) Shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

type DBStatus struct {
	Path           string `json:"path"`
	Investigations int    `json:"investigations"`
	Observations   int    `json:"observations"`
	AdmissionRows  int    `json:"admission_rows"`
	OsintRows      int    `json:"osint_rows"`
	SyntheticRows  int    `json:"synthetic_rows"`
	FTS            string `json:"fts"`
}

func (a *App) DBStatus() (DBStatus, error) {
	if a.db == nil {
		return DBStatus{}, fmt.Errorf("db not open")
	}
	st, err := a.db.Status()
	if err != nil {
		return DBStatus{}, err
	}
	return DBStatus{
		Path: st.Path, Investigations: st.Investigations, Observations: st.Observations,
		AdmissionRows: st.AdmissionRows, OsintRows: st.OsintRows, SyntheticRows: st.SyntheticRows,
		FTS: "sqlite",
	}, nil
}

type ImportReport struct {
	AdmissionRows  int  `json:"admission_rows"`
	OsintRows      int  `json:"osint_rows"`
	SyntheticRows  int  `json:"synthetic_rows"`
	PrivateRows    int  `json:"private_rows"`
	IncludePrivate bool `json:"include_private"`
}

func (a *App) DBImport(path string, includePrivate bool) (ImportReport, error) {
	if a.db == nil {
		return ImportReport{}, fmt.Errorf("db not open")
	}
	rep, err := imp.ImportDB(a.db, path, includePrivate)
	if err != nil {
		return ImportReport{}, err
	}
	return ImportReport{
		AdmissionRows: rep.AdmissionRows, OsintRows: rep.OsintRows,
		SyntheticRows: rep.SyntheticRows, PrivateRows: rep.PrivateRows, IncludePrivate: rep.IncludePrivate,
	}, nil
}

type InvestigateRequest struct {
	Raw   string `json:"raw"`
	Type  string `json:"type"` // optional: username|email|...
}

type InvestigationResult struct {
	ID         string              `json:"id"`
	Target     target.Target       `json:"target"`
	Evidences  []evidence.Evidence `json:"evidences"`
	CreatedAt  time.Time           `json:"created_at"`
}

func (a *App) Investigate(req InvestigateRequest) (InvestigationResult, error) {
	raw := req.Raw
	typ := target.TargetType(req.Type)
	if typ == "" {
		detected, ok := target.AutoDetect(raw)
		if ok {
			typ = detected
		} else {
			typ = target.TypeUsername
		}
	}
	t, err := target.Normalize(raw, typ)
	if err != nil {
		return InvestigationResult{}, err
	}
	reg := providers.DefaultRegistry()
	eng := discovery.New(reg, 5, 8*time.Second)
	results := eng.Investigate(context.Background(), t)
	evs := make([]evidence.Evidence, 0, len(results))
	for _, r := range results {
		evs = append(evs, r.Evidence)
	}
	id := uuid.NewString()
	created := time.Now().UTC()
	if a.db != nil && a.db.SQL != nil {
		_, _ = a.db.SQL.Exec(`INSERT INTO investigations(id, target_raw, target_normalized, target_type, status) VALUES(?,?,?,?,?)`,
			id, t.Raw, t.Normalized, string(t.Type), "completed")
		for _, ev := range evs {
			obsID := uuid.NewString()
			ov, nv, errStr, snip := sql.NullString{}, sql.NullString{}, sql.NullString{}, sql.NullString{}
			if ev.ObservedValue != nil {
				ov = sql.NullString{String: *ev.ObservedValue, Valid: true}
			}
			if ev.NormalizedValue != nil {
				nv = sql.NullString{String: *ev.NormalizedValue, Valid: true}
			}
			if ev.Error != nil {
				errStr = sql.NullString{String: *ev.Error, Valid: true}
			}
			if ev.RawSnippet != nil {
				snip = sql.NullString{String: *ev.RawSnippet, Valid: true}
			}
			_, _ = a.db.SQL.Exec(`INSERT INTO observations(id, investigation_id, provider, query, observed_value, normalized_value, status, confidence, source_url, evidence_type, collection_method, raw_snippet, error, collected_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
				obsID, id, ev.Provider, ev.Query, ov, nv, string(ev.Status), string(ev.Confidence), ev.SourceURL, ev.EvidenceType, ev.CollectionMethod, snip, errStr, ev.Timestamp.Format(time.RFC3339))
		}
	}
	return InvestigationResult{ID: id, Target: t, Evidences: evs, CreatedAt: created}, nil
}

type ProviderInfo struct {
	ID   string   `json:"id"`
	Name string   `json:"name"`
	Types []string `json:"types"`
}

func (a *App) ListProviders() ([]ProviderInfo, error) {
	reg := providers.DefaultRegistry()
	var out []ProviderInfo
	for _, p := range reg.List() {
		var ts []string
		for _, t := range p.TargetTypes() {
			ts = append(ts, string(t))
		}
		out = append(out, ProviderInfo{ID: p.ID(), Name: p.Name(), Types: ts})
	}
	return out, nil
}

type SearchResult struct {
	ID    string `json:"id"`
	Value string `json:"value"`
	Type  string `json:"type"`
}

func (a *App) SearchEntities(q string) ([]SearchResult, error) {
	if a.db == nil {
		return nil, fmt.Errorf("db not open")
	}
	if len(q) < 2 {
		return nil, fmt.Errorf("query too short")
	}
	like := "%" + q + "%"
	rows, err := a.db.SQL.Query(`SELECT canonical_value, type FROM entities WHERE canonical_value LIKE ? LIMIT 20`, like)
	if err != nil {
		// fallback to synthetic tables
		rows, err = a.db.SQL.Query(`SELECT name, 'student' FROM student_data_synthetic WHERE name LIKE ? LIMIT 20`, like)
		if err != nil {
			return nil, err
		}
	}
	defer rows.Close()
	var out []SearchResult
	for rows.Next() {
		var v, t string
		if err := rows.Scan(&v, &t); err != nil {
			continue
		}
		out = append(out, SearchResult{ID: v, Value: v, Type: t})
	}
	return out, nil
}
