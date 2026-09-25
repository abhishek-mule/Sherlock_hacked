package imp

// Classification of backup columns.
const (
	ClassPublic    = "PUBLIC"
	ClassSensitive = "SENSITIVE"
)

// SensitiveColumns for student_data — requires --include-private.
var SensitiveStudentCols = map[string]bool{
	"ADHAAR NO": true, "PASSPORT NO.": true,
	"MOBILE NO.": true, "STUDENT MOBILE NO.2": true, "STUDENT ALTERNATE MOBILE NO.": true,
	"EMAILID": true, "ALTERNATE EMAIL ID": true,
	"DOB": true, "BIRTH_PLACE": true, "BLOOD GROUP": true,
	"ADDRESS(PERMANANT)": true, "CITY/VILLAGE(PERMANANT)": true, "PIN_PER": true,
	"ADDRESS(LOCAL)": true, "PIN_LOCAL": true,
	"FATHERMOBILE": true, "MOTHERMOBILE": true, "FATHER EMAIL": true, "MOTHER EMAIL": true,
	"ANNUAL FAMILY INCOME": true, "BANK NAME": true, "IFSCCODE": true, "BANKADDRESS": true,
	"CATEGORY": true, "SUB_CASTE": true, "SOCIAL CATEGORY": true, "RELIGION": true,
	"PHYSICALLY_HANDICAPPED": true, "TYPE OF DISABILITY": true,
}

// Allowlisted tables for default synthetic import.
var DefaultAllowTables = map[string]bool{
	"admission_data": true, // mht_cet_score branch etc — not highly sensitive
	"osint_data":     true, // 13 rows — github/skills sanitized
}
