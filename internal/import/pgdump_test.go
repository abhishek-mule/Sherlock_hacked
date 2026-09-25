package imp

import (
	"database/sql"
	"os"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	"github.com/abhishek-mule/Sherlock_hacked/internal/db"
)

func TestImportSyntheticDefault(t *testing.T) {
	tmp := t.TempDir() + "/test.db"
	d, err := db.Open(tmp)
	if err != nil { t.Fatalf("open: %v", err) }
	defer d.Close()
	// create a minimal COPY dump
	dump := "COPY public.admission_data (sr_no, merit_no, mht_cet_score, application_id, full_name, gender, category, seat_type, branch, college, city, seat_level, status, admitted, created_at) FROM stdin;\n1\t123\t90.0\tAPP1\tSynthetic User\tM\tOPEN\tLOPEN\tCS\tSynth College\tPune\tState\tAdmitted\t2025-01-01\n\\.\nCOPY public.osint_data (sr_no, roll_no, permanent_registration_no, type, sex, student_name, mother_name, name, connection, title, education_1, education_2, location, github, connections, open_to_work, about, skills, achievements, merit_no, marks, application_id, admission_category, seat_type, pro_pic, posts) FROM stdin;\n1\tR1\tP1\tREG\tMALE\tSynth User\tMother\t\\N\t\\N\t\\N\t\\N\t\\N\tPune\t\\N\t\\N\t\\N\t\\N\tGo\t\\N\t1\t90%\tAPP1\tOPEN\tLOPEN\t\\N\t\\N\n\\.\n"
	f := tmp + ".dump"
	if err := os.WriteFile(f, []byte(dump), 0644); err != nil { t.Fatalf("write dump: %v", err) }
	rep, err := Import(d.SQL, f, false)
	if err != nil { t.Fatalf("import: %v", err) }
	if rep.AdmissionRows != 1 { t.Errorf("admissionRows %d", rep.AdmissionRows) }
	if rep.OsintRows != 1 { t.Errorf("osintRows %d", rep.OsintRows) }
	var c int
	if err := d.SQL.QueryRow(`SELECT COUNT(*) FROM student_data_synthetic`).Scan(&c); err != nil { t.Fatalf("count synthetic: %v", err) }
	if c == 0 { t.Errorf("synthetic not seeded") }
	_ = sql.ErrNoRows
}
