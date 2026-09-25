package correlation

import "github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"

type PotentialRelationship struct {
	EvidenceIDs []string          `json:"evidence_ids"`
	Score       float64           `json:"score"`
	Note        string            `json:"note"`
	Confidence  evidence.Confidence `json:"confidence"`
}

// Engine produces potential relationships — never identity claims.
type Engine struct{}

func New() *Engine { return &Engine{} }

// Correlate groups evidence by normalized value and emits relationships.
// Very conservative: only groups exact normalized matches.
func (e *Engine) Correlate(evidences []evidence.Evidence) []PotentialRelationship {
	groups := make(map[string][]evidence.Evidence)
	for _, ev := range evidences {
		if ev.Status != evidence.StatusFound {
			continue
		}
		key := ""
		if ev.NormalizedValue != nil {
			key = *ev.NormalizedValue
		} else if ev.ObservedValue != nil {
			key = *ev.ObservedValue
		} else {
			continue
		}
		groups[key] = append(groups[key], ev)
	}
	var out []PotentialRelationship
	for key, grp := range groups {
		if len(grp) < 2 {
			continue
		}
		ids := make([]string, 0, len(grp))
		for _, g := range grp {
			ids = append(ids, g.Provider+":"+g.Query)
		}
		out = append(out, PotentialRelationship{
			EvidenceIDs: ids,
			Score:       float64(len(grp)) / 10.0,
			Note:        "shared normalized value: " + key + " — potential relationship, not an identity claim",
			Confidence:  evidence.ConfidenceWeak,
		})
	}
	return out
}
