package confidence

import (
	"strings"

	"github.com/abhishek-mule/Sherlock_hacked/internal/core/evidence"
)

// Compute derives confidence from status + observed signals.
// This is intentionally conservative — never manufactures certainty.
func Compute(status evidence.Status, observedValue *string, body string) evidence.Confidence {
	switch status {
	case evidence.StatusFound:
		if observedValue != nil && strings.TrimSpace(*observedValue) != "" {
			// Strong if we have a verified observed value
			if len(body) > 0 && strings.Contains(strings.ToLower(body), strings.ToLower(*observedValue)) {
				return evidence.ConfidenceStrong
			}
			return evidence.ConfidenceWeak
		}
		return evidence.ConfidenceWeak
	case evidence.StatusNotFound:
		return evidence.ConfidenceNegative
	case evidence.StatusInconclusive:
		return evidence.ConfidenceAmbiguous
	case evidence.StatusRateLimited, evidence.StatusBlocked, evidence.StatusUnavailable, evidence.StatusError:
		return evidence.ConfidenceInconclusive
	default:
		return evidence.ConfidenceInconclusive
	}
}
