package evidence

import (
	"time"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
)

type Status string

const (
	StatusFound        Status = "FOUND"
	StatusNotFound     Status = "NOT_FOUND"
	StatusInconclusive Status = "INCONCLUSIVE"
	StatusRateLimited  Status = "RATE_LIMITED"
	StatusBlocked      Status = "BLOCKED"
	StatusUnavailable  Status = "UNAVAILABLE"
	StatusError        Status = "ERROR"
)

type Confidence string

const (
	ConfidenceVerified    Confidence = "VERIFIED"
	ConfidenceStrong      Confidence = "STRONG"
	ConfidenceWeak        Confidence = "WEAK"
	ConfidenceAmbiguous   Confidence = "AMBIGUOUS"
	ConfidenceNegative    Confidence = "NEGATIVE"
	ConfidenceInconclusive Confidence = "INCONCLUSIVE"
)

type Evidence struct {
	Target           target.Target `json:"target"`
	Provider         string        `json:"provider"`
	Query            string        `json:"query"`
	ObservedValue    *string       `json:"observed_value,omitempty"`
	NormalizedValue  *string       `json:"normalized_value,omitempty"`
	Status           Status        `json:"status"`
	Confidence       Confidence    `json:"confidence"`
	Timestamp        time.Time     `json:"timestamp"`
	SourceURL        string        `json:"source_url"`
	EvidenceType     string        `json:"evidence_type"`
	CollectionMethod string        `json:"collection_method"`
	Error            *string       `json:"error,omitempty"`
	RawSnippet       *string       `json:"raw_snippet,omitempty"`
}

func StrPtr(s string) *string { return &s }
