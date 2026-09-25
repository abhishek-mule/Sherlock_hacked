package main

import (
	"context"
	"database/sql"
	"encoding/json"
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
	results, err := a.db.SearchEntities(q, 20)
	if err != nil {
		return nil, err
	}
	var out []SearchResult
	for _, r := range results {
		out = append(out, SearchResult{ID: r["value"], Value: r["value"], Type: r["type"]})
	}
	return out, nil
}

func (a *App) ListInvestigations(limit int) ([]map[string]interface{}, error) {
	if a.db == nil {
		return nil, fmt.Errorf("db not open")
	}
	return a.db.ListInvestigations(limit)
}

func (a *App) ExportReport(id string, format string) (string, error) {
	if a.db == nil {
		return "", fmt.Errorf("db not open")
	}
	rows, err := a.db.SQL.Query(`SELECT provider, query, status, confidence, source_url, observed_value FROM observations WHERE investigation_id=?`, id)
	if err != nil {
		return "", err
	}
	defer rows.Close()
	var findings []map[string]string
	var providers []string
	for rows.Next() {
		var p, q, s, c, url, ov string
		_ = rows.Scan(&p, &q, &s, &c, &url, &ov)
		findings = append(findings, map[string]string{"provider": p, "query": q, "status": s, "confidence": c, "source_url": url, "observed_value": ov})
		providers = append(providers, p)
	}
	// Build report via internal/report
	invRow := a.db.SQL.QueryRow(`SELECT target_raw, target_type FROM investigations WHERE id=?`, id)
	var raw, typ string
	_ = invRow.Scan(&raw, &typ)
	if raw == "" {
		raw = id
	}
	switch format {
	case "csv":
		var sb string
		sb = "provider,query,status,confidence,source_url,observed_value\n"
		for _, f := range findings {
			sb += f["provider"] + "," + f["query"] + "," + f["status"] + "," + f["confidence"] + "," + f["source_url"] + "," + f["observed_value"] + "\n"
		}
		return sb, nil
	case "md":
		md := "# Investigation " + id + "\n\nTarget: " + raw + " (" + typ + ")\n\n| Provider | Status | Confidence | Source |\n|---|---|---|---|\n"
		for _, f := range findings {
			md += "| " + f["provider"] + " | " + f["status"] + " | " + f["confidence"] + " | " + f["source_url"] + " |\n"
		}
		return md, nil
	default:
		b, _ := json.MarshalIndent(findings, "", "  ")
		return string(b), nil
	}
}
