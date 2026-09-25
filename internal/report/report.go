package report

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
)

type InvestigationReport struct {
	Target           string              `json:"target"`
	TargetType       string              `json:"target_type"`
	CollectedAt      time.Time           `json:"collected_at"`
	SchemaVersion    string              `json:"schema_version"`
	ProvidersQueried []string            `json:"providers_queried"`
	Findings         []evidence.Evidence `json:"findings"`
	CorrelationNotes []string            `json:"correlation_notes"`
}

func ToJSON(r InvestigationReport) ([]byte, error) {
	return json.MarshalIndent(r, "", "  ")
}

func ToCSV(r InvestigationReport) (string, error) {
	var sb strings.Builder
	w := csv.NewWriter(&sb)
	if err := w.Write([]string{"provider", "query", "status", "confidence", "source_url", "observed_value"}); err != nil {
		return "", err
	}
	for _, f := range r.Findings {
		ov := ""
		if f.ObservedValue != nil {
			ov = *f.ObservedValue
		}
		if err := w.Write([]string{f.Provider, f.Query, string(f.Status), string(f.Confidence), f.SourceURL, ov}); err != nil {
			return "", err
		}
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return "", err
	}
	return sb.String(), nil
}

func ToMarkdown(r InvestigationReport) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# Investigation Report\n\n")
	fmt.Fprintf(&sb, "- **Target:** %s (%s)\n", r.Target, r.TargetType)
	fmt.Fprintf(&sb, "- **Collected:** %s\n", r.CollectedAt.Format(time.RFC3339))
	fmt.Fprintf(&sb, "- **Schema:** %s\n", r.SchemaVersion)
	fmt.Fprintf(&sb, "- **Providers:** %s\n\n", strings.Join(r.ProvidersQueried, ", "))
	sb.WriteString("## Findings\n\n")
	sb.WriteString("| Provider | Status | Confidence | Source |\n")
	sb.WriteString("|---|---|---|---|\n")
	for _, f := range r.Findings {
		fmt.Fprintf(&sb, "| %s | %s | %s | %s |\n", f.Provider, f.Status, f.Confidence, f.SourceURL)
	}
	if len(r.CorrelationNotes) > 0 {
		sb.WriteString("\n## Correlation Notes\n\n")
		for _, n := range r.CorrelationNotes {
			fmt.Fprintf(&sb, "- %s\n", n)
		}
		sb.WriteString("\n> Correlation is potential relationship only — not an identity claim.\n")
	}
	return sb.String()
}
