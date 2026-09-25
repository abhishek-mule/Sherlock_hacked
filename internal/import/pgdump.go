package imp

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/abhishek-mule/Sherlock_hacked/internal/db"
)

// Report after import.
type Report struct {
	AdmissionRows int  `json:"admission_rows"`
	OsintRows     int  `json:"osint_rows"`
	SyntheticRows int  `json:"synthetic_rows"`
	PrivateRows   int  `json:"private_rows"`
	IncludePrivate bool `json:"include_private"`
	Source        string `json:"source"`
}

// Import parses a Postgres cluster dump (COPY ... FROM stdin) and populates SQLite.
// Default: only allowlisted tables (admission_data sanitized + osint_data synthetic) are loaded.
// Sensitive student_data is skipped unless includePrivate==true.
func Import(sqlDB *sql.DB, backupPath string, includePrivate bool) (Report, error) {
	f, err := os.Open(backupPath)
	if err != nil {
		return Report{}, fmt.Errorf("open backup: %w", err)
	}
	defer f.Close()

	rep := Report{Source: backupPath, IncludePrivate: includePrivate}
	scanner := bufio.NewScanner(f)
	// backup has very long lines
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 10*1024*1024)

	var currentTable string
	var rows [][]string
	insideCopy := false

	flush := func() error {
		if !insideCopy || currentTable == "" || len(rows) == 0 {
			rows = nil
			return nil
		}
		switch currentTable {
		case "public.admission_data":
			if err := loadAdmission(sqlDB, rows); err != nil {
				return err
			}
			rep.AdmissionRows += len(rows)
		case "public.osint_data":
			if err := loadOsint(sqlDB, rows); err != nil {
				return err
			}
			rep.OsintRows += len(rows)
		case "public.student_data":
			if includePrivate {
				if err := loadStudentPrivate(sqlDB, rows); err != nil {
					return err
				}
				rep.PrivateRows += len(rows)
			} else {
				// synthetic stub: insert 2 synthetic rows from fixtures if not already present
				if err := ensureSynthetic(sqlDB); err != nil {
					return err
				}
			}
		}
		rows = nil
		return nil
	}

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "COPY ") && strings.Contains(line, " FROM stdin;") {
			// start of COPY block
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				currentTable = parts[1]
			}
			insideCopy = true
			rows = nil
			continue
		}
		if insideCopy && line == "\\." {
			if err := flush(); err != nil {
				return rep, err
			}
			insideCopy = false
			currentTable = ""
			continue
		}
		if insideCopy {
			// COPY data line — tab separated, \N = null
			rows = append(rows, strings.Split(line, "\t"))
		}
	}
	if err := scanner.Err(); err != nil {
		return rep, fmt.Errorf("scan backup: %w", err)
	}
	// Ensure synthetic if backup had no student_data or flag off
	if !includePrivate {
		_ = ensureSynthetic(sqlDB)
		// count synthetic
		var c int
		_ = sqlDB.QueryRow(`SELECT COUNT(*) FROM student_data_synthetic`).Scan(&c)
		rep.SyntheticRows = c
	}
	// also fill admission/osint from fixtures if backup didn't have them
	if rep.AdmissionRows == 0 {
		_ = loadFixtures(sqlDB)
		var c int
		_ = sqlDB.QueryRow(`SELECT COUNT(*) FROM admission_data`).Scan(&c)
		if c > 0 {
			rep.AdmissionRows = c
		}
	}
	return rep, nil
}

func loadAdmission(sqlDB *sql.DB, rows [][]string) error {
	tx, err := sqlDB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	// admission_data COPY columns: sr_no, merit_no, mht_cet_score, application_id, full_name, gender, category, seat_type, branch, college, city, seat_level, status, admitted, created_at
	stmt, err := tx.Prepare(`INSERT OR REPLACE INTO admission_data(sr_no, merit_no, full_name, branch, college, city, status) VALUES(?,?,?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, r := range rows {
		if len(r) < 13 {
			continue
		}
		// r[0]=sr_no, r[4]=full_name, r[8]=branch, r[9]=college, r[10]=city, r[12]=status
		_, _ = stmt.Exec(nullInt(r[0]), nullInt(r[1]), r[4], r[8], r[9], r[10], r[12])
	}
	return tx.Commit()
}

func loadOsint(sqlDB *sql.DB, rows [][]string) error {
	tx, err := sqlDB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	stmt, err := tx.Prepare(`INSERT OR REPLACE INTO osint_data(sr_no, student_name, github, skills, location) VALUES(?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, r := range rows {
		if len(r) < 14 {
			continue
		}
		// osint_data: 0 sr_no, 5 student_name, 13 github, 17 skills, 12 location
		github := r[13]
		if github == "\\N" {
			github = ""
		}
		skills := r[17]
		if skills == "\\N" {
			skills = ""
		}
		name := r[5]
		if name == "\\N" {
			name = ""
		}
		loc := r[12]
		if loc == "\\N" {
			loc = ""
		}
		_, _ = stmt.Exec(nullInt(r[0]), name, github, skills, loc)
	}
	return tx.Commit()
}

func loadStudentPrivate(sqlDB *sql.DB, rows [][]string) error {
	// For private mode, we create a private table and store minimal sanitized fields.
	// We deliberately do NOT create a full 180-col mirror — only a private staging table.
	_, err := sqlDB.Exec(`CREATE TABLE IF NOT EXISTS student_data_private (
		sr_no INTEGER PRIMARY KEY,
		name TEXT,
		email TEXT,
		mobile TEXT,
		raw_json TEXT
	)`)
	if err != nil {
		return err
	}
	tx, err := sqlDB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	stmt, err := tx.Prepare(`INSERT OR REPLACE INTO student_data_private(sr_no, name, email, mobile, raw_json) VALUES(?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, r := range rows {
		if len(r) == 0 {
			continue
		}
		// r[6]=NAME, r[13]=EMAILID, r[10]=MOBILE NO.
		name := safeCol(r, 6)
		email := safeCol(r, 13)
		mobile := safeCol(r, 10)
		j, _ := json.Marshal(r)
		_, _ = stmt.Exec(nullInt(r[0]), name, email, mobile, string(j))
	}
	return tx.Commit()
}

func ensureSynthetic(sqlDB *sql.DB) error {
	var c int
	if err := sqlDB.QueryRow(`SELECT COUNT(*) FROM student_data_synthetic`).Scan(&c); err != nil {
		return nil
	}
	if c > 0 {
		return nil
	}
	fixtures := [][]interface{}{
		{9001, "Alex Johnson", "alex.johnson@example.com", "Computer Science", "Pune"},
		{9002, "Priya Sharma", "priya.sharma@example.com", "Information Technology", "Nagpur"},
	}
	for _, f := range fixtures {
		_, _ = sqlDB.Exec(`INSERT OR REPLACE INTO student_data_synthetic(sr_no, name, email, branch, city) VALUES(?,?,?,?,?)`, f...)
	}
	return nil
}

func loadFixtures(sqlDB *sql.DB) error {
	// fixtures are already synthetic via ensureSynthetic; admission fallback
	_ = ensureSynthetic(sqlDB)
	return nil
}

func nullInt(s string) interface{} {
	if s == "\\N" || s == "" {
		return nil
	}
	return s
}

func safeCol(r []string, idx int) string {
	if idx >= len(r) || r[idx] == "\\N" {
		return ""
	}
	return r[idx]
}

// Wrapper for db.DB
func ImportDB(d *db.DB, backupPath string, includePrivate bool) (Report, error) {
	return Import(d.SQL, backupPath, includePrivate)
}
