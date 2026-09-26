import { promises as fs } from "fs";
import path from "path";

/** Field groups for rendering the full record as a structured profile. */
export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

const GROUPS: { key: string; label: string; fields: string[] }[] = [
  {
    key: "identity",
    label: "Identity",
    fields: ["SRNO", "NAME", "FIRSTNAME", "MIDDLE NAME", "LAST NAME", "GENDER", "DOB", "BIRTH_PLACE",
             "NATIONALITY", "BLOOD GROUP", "MARITAL STATUS", "RELIGION", "CATEGORY", "SUB_CASTE",
             "SOCIAL CATEGORY", "PHYSICALLY_HANDICAPPED", "TYPE OF DISABILITY", "ADHAAR NO",
             "PASSPORT NO.", "IDENTI_MARK", "MTONGUE", "OTHER LANGUAGE", "HEIGHT", "WEIGHT"],
  },
  {
    key: "contact",
    label: "Contact",
    fields: ["MOBILE NO.", "STUDENT MOBILE NO.2", "STUDENT ALTERNATE MOBILE NO.", "EMAILID",
             "ALTERNATE EMAIL ID", "LANDLINE NO", "LANDLINE NO_LOCAL"],
  },
  {
    key: "enrollment",
    label: "Enrollment & Admission",
    fields: ["REGISTRATION_NO", "ENROLLMENT NUMBER", "ABC ID NUMBER", "ROLLNO", "ADMISSION TYPE",
             "ADMISSION TYPE1", "ADMISSION THROUGH", "ADMISSION DATE", "ADMISSION BATCH",
             "ADMISSION CATEGORY", "INTEGRATED APPLICATION ID", "PROGRAM LEVEL", "YEAR", "SEMESTER",
             "ACADEMIC YEAR", "PROGRAMME/BRANCH", "DEGREE", "MEDIUM OF INSTRUCTION",
             "HOSTELLER", "TRANSPORTATION", "PAYMENT TYPE", "ADMITTED STATUS", "ADMISSION STATUS",
             "INFORMATION VERIFIED", "UPLOADED DOCUMENTS", "Merit_no."],
  },
  {
    key: "family",
    label: "Family",
    fields: ["IS PARENTS ALIVE", "FATHERNAME", "FATHERMIDDLENAME", "FATHERLASTNAME", "FATHERMOBILE",
             "FATHER'S ALTERNATE MOBILE NO.", "FATHER'S OFFICE PHONE NO.", "FATHER'S QUALIFICATION",
             "FATHER'S OCCUPATION", "FATHER EMAIL", "MOTHERNAME", "MOTHERMOBILE",
             "MOTHER'S ALTERNATE MOBILE NO.", "MOTHER'S QUALIFICATION", "MOTHER'S OCCUPATION",
             "MOTHER EMAIL", "MOTHER'S OFFICE PHONE NO", "ANNUAL FAMILY INCOME",
             "GUARDIAN NAME", "GUARDIAN CONTACT NO", "RELATION WITH GUARDIAN",
             "GUARDIAN OCCUPATION", "GUARDIAN QUALIFICATION"],
  },
  {
    key: "address",
    label: "Address",
    fields: ["ADDRESS(PERMANENT)", "CITY/VILLAGE(PERMANENT)", "TALUKA(PERMANENT)", "DISTRICT_PERMANENT",
             "STATE_PERMANENT", "AREA POST OFFICE", "AREA POLICE STATION", "PIN_PER",
             "ADDRESS(LOCAL)", "CITY/VILLAGE(LOCAL)", "TALUKA(LOCAL)", "DISTRICT_LOCAL",
             "STATE_LOCAL", "LANDLINE NO_LOCAL", "AREA POST OFFICE LOCAL", "AREA POLICE STATION LOCAL",
             "PIN_LOCAL"],
  },
  {
    key: "schooling",
    label: "Schooling (10th)",
    fields: ["SCHOOL/COLLEGE", "10TH SCHOOL/COLLEGE NAME", "10TH BOARD", "10TH YEAR OF EXAM", "10TH MEDIUM",
             "10TH MARKS OBTAINED", "10TH OUT OF MARKS", "10TH PERCENTILE", "SEAT NO.",
             "SCHOOL/COLLEGE ADDRESS"],
  },
  {
    key: "higher",
    label: "Higher Secondary (12th)",
    fields: ["12TH SCHOOL/COLLEGE NAME", "12TH BOARD", "12TH YEAR OF EXAM", "12TH MEDIUM", "12TH SEAT NO.",
             "PHY. OBT. MARKS", "PHY. TOTAL MARKS", "CHE. OBT. MARKS", "CHE. TOTAL MARKS",
             "MATH OBT. MARKS", "MATH TOTAL MARKS", "PCM OBT. MARKS", "PCM PERCENTAGE",
             "VOCATIONAL SUBJECT", "VOC. OBTAINED MARKS", "VOC. TOTAL MARKS",
             "12TH MARKS OBTAINED", "12TH OUT OF MARKS", "12TH PERCENTILE",
             "12TH SCHOOL/COLLEGE ADDRESS"],
  },
  {
    key: "diploma",
    label: "Diploma",
    fields: ["DIPLOMA SCHOOL/COLLEGE NAME", "DIPLOMA BOARD", "DIPLOMA YEAR OF EXAM", "DIPLOMA MEDIUM",
             "DIPLOMA MARKS OBTAINED", "DIPLOMA OUT OF MARKS", "DIPLOMA PERCENTILE", "DIPLOMA SEAT NO.",
             "DIPLOMA SCHOOL/COLLEGE ADDRESS"],
  },
  {
    key: "entrance",
    label: "Entrance Exam",
    fields: ["ENTRANCE EXAM", "ENTRANCE EXAM SEAT NO.", "ENTRANCE EXAM NAME", "ENTRANCE EXAM SEAT NUMBER",
             "YEAR_OF_EXAM", "PERCENTILE(ENTRANCE EXAM)", "ENTRANCE EXAM YEAR", "ENTRANCE EXAM PERCENTAGE",
             "RANK"],
  },
  {
    key: "qualification",
    label: "Last Qualification",
    fields: ["LAST QUALIFICATION", "LAST QUALIFICATION SCHOOL / COLLEGE NAME", "LAST QUALIFICATION BOARD",
             "LAST QUALIFICATION QUALIFYING EXAM", "LAST QUALIFICATION SEAT NO.",
             "LAST QUALIFICATION YEAR OF EXAM", "LAST QUALIFICATION MARK OBTAINED",
             "LAST QUALIFICATION OUT OF MARKS", "LAST QUALIFICATION PERCENTAGE",
             "LAST QUALIFICATION GRADE", "LAST QUALIFICATION DGPA/CGPA",
             "LAST QUALIFICATION COLLEGE ADDRESS"],
  },
  {
    key: "phd",
    label: "PhD",
    fields: ["PHD SCHOOL/COLLEGE NAME", "PHD BOARD", "PHD QUALIFYING EXAM", "PHD YEAR OF EXAM",
             "PHD SEAT NO.", "PHD MARKS OBTAINED", "PHD OUT OF MARKS", "PHD PERCENTAGE",
             "PHD GRADE", "PHD SCHOOL/COLLEGE ADDRESS"],
  },
  {
    key: "health",
    label: "Vaccination",
    fields: ["ARE YOU VACCINATED ? YES OR NO", "VACCINE NAME", "FIRSTDOSE_VACCINATION_CENTER",
             "SECONDDOSE_VACCINATION_CENTER", "FIRSTDOSE_VACCINATED_DATE", "SECONDDOSE_VACCINATED_DATE"],
  },
  {
    key: "bank",
    label: "Bank & Sports",
    fields: ["BANK NAME", "IFSCCODE", "BANKADDRESS", "SPORT_NAME", "SPORT_LEVEL", "ACHIEVEMENT_DETAILS"],
  },
];

export async function GET() {
  const file = path.join(process.cwd(), "data", "full-students.json");
  let rows: Row[] = [];
  try {
    rows = JSON.parse(await fs.readFile(file, "utf8")) as Row[];
  } catch {
    return Response.json({ ok: false, reason: "no_local_dataset", groups: [] });
  }
  const cols = rows.length ? Object.keys(rows[0]).filter((k) => !k.startsWith("_")) : [];
  return Response.json({ ok: true, groups: GROUPS, total_columns: cols.length });
}
