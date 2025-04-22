import React, { useState, useMemo, useRef } from 'react';
import { Student } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  HeartPulse, 
  Home,
  Users,
  Briefcase,
  School,
  CreditCard,
  Activity,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowDownUp,
  Globe,
  AlertTriangle,
  Download,
  Printer,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AllStudentInfoProps {
  student: Student;
}

// Function to format field labels for better readability
const formatFieldLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper for formatting values
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function AllStudentInfo({ student }: AllStudentInfoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal', 'academic']);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const printableRef = useRef<HTMLDivElement>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Comprehensive sections of student information
  const sections = useMemo(() => [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: <User className="h-5 w-5 text-blue-500" />,
      fields: [
        { key: 'id', label: 'Student ID' },
        { key: 'name', label: 'First Name' },
        { key: 'surname', label: 'Last Name' },
        { key: 'email', label: 'Email Address' },
        { key: 'rollno', label: 'Roll Number' },
        { key: 'registrationNo', label: 'Registration Number' },
        { key: 'enrollmentNumber', label: 'Enrollment Number' },
        { key: 'mobileNo', label: 'Mobile Number' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'gender', label: 'Gender' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'maritalStatus', label: 'Marital Status' },
        { key: 'religion', label: 'Religion' },
        { key: 'category', label: 'Category' },
        { key: 'subcast', label: 'Sub-caste' },
        { key: 'adhaarNo', label: 'Aadhaar Number' },
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        { key: 'physically_handicapped', label: 'Physically Handicapped' },
        { key: 'sport_name', label: 'Sport' },
        // Extended personal fields (expand to accommodate more columns)
        { key: 'date_of_birth', label: 'Date of Birth (Full)' },
        { key: 'place_of_birth', label: 'Place of Birth' },
        { key: 'age', label: 'Age' },
        { key: 'passport_number', label: 'Passport Number' },
        { key: 'passport_expiry', label: 'Passport Expiry' },
        { key: 'driving_license', label: 'Driving License' },
        { key: 'personal_email', label: 'Personal Email' },
        { key: 'institutional_email', label: 'Institutional Email' },
        { key: 'emergency_contact_name', label: 'Emergency Contact Name' },
        { key: 'emergency_contact_relation', label: 'Emergency Contact Relation' },
        { key: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
        { key: 'student_photo_id', label: 'Student Photo ID' },
        { key: 'languages_known', label: 'Languages Known' },
        { key: 'hobbies', label: 'Hobbies' },
        { key: 'interests', label: 'Interests' }
      ]
    },
    {
      id: 'family',
      title: 'Family Information',
      icon: <Users className="h-5 w-5 text-green-500" />,
      fields: [
        { key: 'father_name', label: 'Father\'s Name' },
        { key: 'occupation', label: 'Father\'s Occupation' },
        { key: 'motherName', label: 'Mother\'s Name' },
        { key: 'motherOccupation', label: 'Mother\'s Occupation' },
        { key: 'annualFamilyIncome', label: 'Annual Family Income' },
        { key: 'socialCategory', label: 'Social Category' },
        // Extended family fields
        { key: 'father_qualification', label: 'Father\'s Qualification' },
        { key: 'father_designation', label: 'Father\'s Designation' },
        { key: 'father_company', label: 'Father\'s Company/Organization' },
        { key: 'father_email', label: 'Father\'s Email' },
        { key: 'father_mobile', label: 'Father\'s Mobile' },
        { key: 'father_office_address', label: 'Father\'s Office Address' },
        { key: 'mother_qualification', label: 'Mother\'s Qualification' },
        { key: 'mother_designation', label: 'Mother\'s Designation' },
        { key: 'mother_company', label: 'Mother\'s Company/Organization' },
        { key: 'mother_email', label: 'Mother\'s Email' },
        { key: 'mother_mobile', label: 'Mother\'s Mobile' },
        { key: 'mother_office_address', label: 'Mother\'s Office Address' },
        { key: 'guardian_name', label: 'Guardian\'s Name' },
        { key: 'guardian_relation', label: 'Guardian\'s Relation' },
        { key: 'guardian_occupation', label: 'Guardian\'s Occupation' },
        { key: 'guardian_qualification', label: 'Guardian\'s Qualification' },
        { key: 'guardian_email', label: 'Guardian\'s Email' },
        { key: 'guardian_mobile', label: 'Guardian\'s Mobile' },
        { key: 'guardian_address', label: 'Guardian\'s Address' },
        { key: 'siblings_count', label: 'Number of Siblings' }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Phone className="h-5 w-5 text-purple-500" />,
      fields: [
        { key: 'address_permanant', label: 'Permanent Address' },
        { key: 'city_village_permanant', label: 'City/Village (Permanent)' },
        { key: 'district_permanant', label: 'District (Permanent)' },
        { key: 'state_permanant', label: 'State (Permanent)' },
        { key: 'address_local', label: 'Local Address' },
        { key: 'pin_local', label: 'PIN Code (Local)' },
        // Extended contact fields
        { key: 'country_permanant', label: 'Country (Permanent)' },
        { key: 'pin_permanant', label: 'PIN Code (Permanent)' },
        { key: 'phone_permanant', label: 'Phone (Permanent)' },
        { key: 'city_village_local', label: 'City/Village (Local)' },
        { key: 'district_local', label: 'District (Local)' },
        { key: 'state_local', label: 'State (Local)' },
        { key: 'country_local', label: 'Country (Local)' },
        { key: 'phone_local', label: 'Phone (Local)' },
        { key: 'hostel_name', label: 'Hostel Name' },
        { key: 'hostel_room_number', label: 'Hostel Room Number' },
        { key: 'hostel_warden_name', label: 'Hostel Warden Name' },
        { key: 'hostel_warden_contact', label: 'Hostel Warden Contact' },
        { key: 'primary_mobile', label: 'Primary Mobile' },
        { key: 'secondary_mobile', label: 'Secondary Mobile' },
        { key: 'landline_number', label: 'Landline Number' },
        { key: 'current_residence_type', label: 'Current Residence Type' }
      ]
    },
    {
      id: 'academic',
      title: 'Academic Information',
      icon: <BookOpen className="h-5 w-5 text-amber-500" />,
      fields: [
        { key: 'admissionType', label: 'Admission Type' },
        { key: 'tenth_marks_obtained', label: '10th Marks Obtained' },
        { key: 'tenth_out_of_marks', label: '10th Total Marks' },
        { key: 'twelfth_marks_obtained', label: '12th Marks Obtained' },
        { key: 'twelfth_out_of_marks', label: '12th Total Marks' },
        { key: 'diploma_marks_obtained', label: 'Diploma Marks' },
        { key: 'entrance_exam_percentage', label: 'Entrance Exam Percentage' },
        // Extended academic fields
        { key: 'current_semester', label: 'Current Semester' },
        { key: 'current_year', label: 'Current Year' },
        { key: 'admission_date', label: 'Admission Date' },
        { key: 'batch', label: 'Batch' },
        { key: 'program', label: 'Program' },
        { key: 'department', label: 'Department' },
        { key: 'specialization', label: 'Specialization' },
        { key: 'section', label: 'Section' },
        { key: 'campus', label: 'Campus' },
        { key: 'current_cgpa', label: 'Current CGPA' },
        { key: 'current_percentage', label: 'Current Percentage' },
        { key: 'student_rank', label: 'Student Rank' },
        { key: 'academic_status', label: 'Academic Status' },
        { key: 'expected_graduation_date', label: 'Expected Graduation Date' },
        { key: 'tenth_board', label: '10th Board' },
        { key: 'tenth_year', label: '10th Year' },
        { key: 'tenth_school', label: '10th School' },
        { key: 'tenth_percentage', label: '10th Percentage' },
        { key: 'twelfth_board', label: '12th Board' },
        { key: 'twelfth_year', label: '12th Year' },
        { key: 'twelfth_school', label: '12th School' },
        { key: 'twelfth_percentage', label: '12th Percentage' },
        { key: 'diploma_institute', label: 'Diploma Institute' },
        { key: 'diploma_year', label: 'Diploma Year' },
        { key: 'diploma_percentage', label: 'Diploma Percentage' },
        { key: 'entrance_exam_name', label: 'Entrance Exam Name' },
        { key: 'entrance_exam_year', label: 'Entrance Exam Year' },
        { key: 'entrance_exam_rank', label: 'Entrance Exam Rank' },
        { key: 'entrance_exam_score', label: 'Entrance Exam Score' },
        { key: 'scholarship_details', label: 'Scholarship Details' },
        { key: 'scholarship_amount', label: 'Scholarship Amount' },
        { key: 'scholarship_provider', label: 'Scholarship Provider' }
      ]
    },
    {
      id: 'courses',
      title: 'Courses & Subjects',
      icon: <GraduationCap className="h-5 w-5 text-indigo-500" />,
      fields: [
        // Course-related fields
        { key: 'current_courses', label: 'Current Courses' },
        { key: 'completed_courses', label: 'Completed Courses' },
        { key: 'elective_courses', label: 'Elective Courses' },
        { key: 'pending_courses', label: 'Pending Courses' },
        { key: 'failed_courses', label: 'Failed Courses' },
        { key: 'retake_courses', label: 'Retake Courses' },
        { key: 'course_1_name', label: 'Course 1 Name' },
        { key: 'course_1_code', label: 'Course 1 Code' },
        { key: 'course_1_credits', label: 'Course 1 Credits' },
        { key: 'course_1_grade', label: 'Course 1 Grade' },
        { key: 'course_2_name', label: 'Course 2 Name' },
        { key: 'course_2_code', label: 'Course 2 Code' },
        { key: 'course_2_credits', label: 'Course 2 Credits' },
        { key: 'course_2_grade', label: 'Course 2 Grade' },
        { key: 'course_3_name', label: 'Course 3 Name' },
        { key: 'course_3_code', label: 'Course 3 Code' },
        { key: 'course_3_credits', label: 'Course 3 Credits' },
        { key: 'course_3_grade', label: 'Course 3 Grade' },
        { key: 'course_4_name', label: 'Course 4 Name' },
        { key: 'course_4_code', label: 'Course 4 Code' },
        { key: 'course_4_credits', label: 'Course 4 Credits' },
        { key: 'course_4_grade', label: 'Course 4 Grade' },
        { key: 'course_5_name', label: 'Course 5 Name' },
        { key: 'course_5_code', label: 'Course 5 Code' },
        { key: 'course_5_credits', label: 'Course 5 Credits' },
        { key: 'course_5_grade', label: 'Course 5 Grade' },
        { key: 'major_name', label: 'Major Name' },
        { key: 'minor_name', label: 'Minor Name' },
        { key: 'practical_labs', label: 'Practical Labs' },
        { key: 'thesis_supervisor', label: 'Thesis Supervisor' },
        { key: 'thesis_title', label: 'Thesis Title' }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Records',
      icon: <Activity className="h-5 w-5 text-rose-500" />,
      fields: [
        // Attendance-related fields
        { key: 'overall_attendance_percentage', label: 'Overall Attendance %' },
        { key: 'current_semester_attendance', label: 'Current Semester Attendance %' },
        { key: 'last_attendance_date', label: 'Last Attendance Date' },
        { key: 'attendance_warnings', label: 'Attendance Warnings' },
        { key: 'course_1_attendance', label: 'Course 1 Attendance %' },
        { key: 'course_2_attendance', label: 'Course 2 Attendance %' },
        { key: 'course_3_attendance', label: 'Course 3 Attendance %' },
        { key: 'course_4_attendance', label: 'Course 4 Attendance %' },
        { key: 'course_5_attendance', label: 'Course 5 Attendance %' },
        { key: 'leaves_taken', label: 'Leaves Taken' },
        { key: 'medical_leaves', label: 'Medical Leaves' },
        { key: 'casual_leaves', label: 'Casual Leaves' },
        { key: 'absence_reason', label: 'Absence Reason' },
        { key: 'attendance_remarks', label: 'Attendance Remarks' }
      ]
    },
    {
      id: 'achievements',
      title: 'Achievements & Certifications',
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      fields: [
        // Achievement-related fields
        { key: 'academic_achievements', label: 'Academic Achievements' },
        { key: 'co_curricular_achievements', label: 'Co-curricular Achievements' },
        { key: 'sports_achievements', label: 'Sports Achievements' },
        { key: 'cultural_achievements', label: 'Cultural Achievements' },
        { key: 'certificates_earned', label: 'Certificates Earned' },
        { key: 'awards_received', label: 'Awards Received' },
        { key: 'competitions_participated', label: 'Competitions Participated' },
        { key: 'workshops_attended', label: 'Workshops Attended' },
        { key: 'conferences_attended', label: 'Conferences Attended' },
        { key: 'internships_completed', label: 'Internships Completed' },
        { key: 'projects_completed', label: 'Projects Completed' },
        { key: 'research_papers', label: 'Research Papers' },
        { key: 'patents_filed', label: 'Patents Filed' },
        { key: 'dean_list_awards', label: 'Dean\'s List Awards' },
        { key: 'scholarship_awards', label: 'Scholarship Awards' }
      ]
    },
    {
      id: 'health',
      title: 'Health Information',
      icon: <HeartPulse className="h-5 w-5 text-red-500" />,
      fields: [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'physically_handicapped', label: 'Physically Handicapped' },
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        // Extended health fields
        { key: 'medical_condition', label: 'Medical Condition' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'medications', label: 'Medications' },
        { key: 'vaccination_status', label: 'Vaccination Status' },
        { key: 'medical_insurance_provider', label: 'Medical Insurance Provider' },
        { key: 'medical_insurance_id', label: 'Medical Insurance ID' },
        { key: 'medical_history', label: 'Medical History' },
        { key: 'disability_details', label: 'Disability Details' },
        { key: 'disability_percentage', label: 'Disability Percentage' },
        { key: 'disability_certificate', label: 'Disability Certificate' },
        { key: 'health_remarks', label: 'Health Remarks' },
        { key: 'last_medical_checkup', label: 'Last Medical Checkup' }
      ]
    },
    {
      id: 'residence',
      title: 'Residence & Hostel Information',
      icon: <Home className="h-5 w-5 text-emerald-500" />,
      fields: [
        // Residence-related fields
        { key: 'residence_type', label: 'Residence Type' },
        { key: 'hostel_name', label: 'Hostel Name' },
        { key: 'hostel_block', label: 'Hostel Block' },
        { key: 'hostel_room_number', label: 'Room Number' },
        { key: 'hostel_floor', label: 'Floor' },
        { key: 'hostel_bed_number', label: 'Bed Number' },
        { key: 'hostel_joining_date', label: 'Hostel Joining Date' },
        { key: 'mess_name', label: 'Mess Name' },
        { key: 'mess_type', label: 'Mess Type' },
        { key: 'hostel_fees', label: 'Hostel Fees' },
        { key: 'mess_fees', label: 'Mess Fees' },
        { key: 'hostel_warden_name', label: 'Warden Name' },
        { key: 'hostel_warden_contact', label: 'Warden Contact' },
        { key: 'roommate_details', label: 'Roommate Details' },
        { key: 'hostel_address', label: 'Hostel Address' }
      ]
    },
    {
      id: 'fees',
      title: 'Fees & Financial Information',
      icon: <CreditCard className="h-5 w-5 text-gray-500" />,
      fields: [
        // Fee-related fields
        { key: 'tuition_fees', label: 'Tuition Fees' },
        { key: 'hostel_fees', label: 'Hostel Fees' },
        { key: 'transport_fees', label: 'Transport Fees' },
        { key: 'library_fees', label: 'Library Fees' },
        { key: 'caution_deposit', label: 'Caution Deposit' },
        { key: 'exam_fees', label: 'Exam Fees' },
        { key: 'total_fees_paid', label: 'Total Fees Paid' },
        { key: 'fees_pending', label: 'Fees Pending' },
        { key: 'last_payment_date', label: 'Last Payment Date' },
        { key: 'last_payment_amount', label: 'Last Payment Amount' },
        { key: 'payment_mode', label: 'Payment Mode' },
        { key: 'transaction_id', label: 'Transaction ID' },
        { key: 'fee_receipt_number', label: 'Fee Receipt Number' },
        { key: 'scholarship_amount', label: 'Scholarship Amount' },
        { key: 'fee_concession', label: 'Fee Concession' },
        { key: 'fee_waiver', label: 'Fee Waiver' },
        { key: 'financial_aid', label: 'Financial Aid' },
        { key: 'loan_details', label: 'Loan Details' }
      ]
    },
    {
      id: 'banking',
      title: 'Banking Details',
      icon: <CreditCard className="h-5 w-5 text-blue-400" />,
      fields: [
        { key: 'bank_name', label: 'Bank Name' },
        { key: 'ifsccode', label: 'IFSC Code' },
        // Extended banking fields
        { key: 'account_number', label: 'Account Number' },
        { key: 'account_holder_name', label: 'Account Holder Name' },
        { key: 'branch_name', label: 'Branch Name' },
        { key: 'account_type', label: 'Account Type' },
        { key: 'micr_code', label: 'MICR Code' },
        { key: 'pan_number', label: 'PAN Number' },
        { key: 'parent_bank_name', label: 'Parent Bank Name' },
        { key: 'parent_account_number', label: 'Parent Account Number' },
        { key: 'parent_ifsc_code', label: 'Parent IFSC Code' }
      ]
    },
    {
      id: 'documents',
      title: 'Document Information',
      icon: <FileText className="h-5 w-5 text-cyan-500" />,
      fields: [
        { key: 'adhaarNo', label: 'Aadhaar Number' },
        // Extended document fields
        { key: 'aadhar_verified', label: 'Aadhaar Verified' },
        { key: 'pan_card', label: 'PAN Card' },
        { key: 'voter_id', label: 'Voter ID' },
        { key: 'passport_number', label: 'Passport Number' },
        { key: 'driving_license', label: 'Driving License' },
        { key: 'migration_certificate', label: 'Migration Certificate' },
        { key: 'transfer_certificate', label: 'Transfer Certificate' },
        { key: 'character_certificate', label: 'Character Certificate' },
        { key: 'domicile_certificate', label: 'Domicile Certificate' },
        { key: 'income_certificate', label: 'Income Certificate' },
        { key: 'caste_certificate', label: 'Caste Certificate' },
        { key: 'disability_certificate', label: 'Disability Certificate' },
        { key: 'birth_certificate', label: 'Birth Certificate' },
        { key: 'medical_certificate', label: 'Medical Certificate' },
        { key: 'sports_certificate', label: 'Sports Certificate' },
        { key: 'gap_certificate', label: 'Gap Certificate' },
        { key: 'documents_submitted', label: 'Documents Submitted' },
        { key: 'documents_pending', label: 'Documents Pending' },
        { key: 'document_remarks', label: 'Document Remarks' }
      ]
    },
    {
      id: 'placement',
      title: 'Placement & Career Information',
      icon: <Briefcase className="h-5 w-5 text-orange-500" />,
      fields: [
        // Placement-related fields
        { key: 'placement_status', label: 'Placement Status' },
        { key: 'placement_company', label: 'Placement Company' },
        { key: 'placement_position', label: 'Placement Position' },
        { key: 'placement_package', label: 'Placement Package' },
        { key: 'placement_location', label: 'Placement Location' },
        { key: 'placement_date', label: 'Placement Date' },
        { key: 'joining_date', label: 'Joining Date' },
        { key: 'internship_company', label: 'Internship Company' },
        { key: 'internship_position', label: 'Internship Position' },
        { key: 'internship_duration', label: 'Internship Duration' },
        { key: 'internship_stipend', label: 'Internship Stipend' },
        { key: 'internship_certificate', label: 'Internship Certificate' },
        { key: 'career_counseling', label: 'Career Counseling' },
        { key: 'resume_details', label: 'Resume Details' },
        { key: 'skillset', label: 'Skillset' },
        { key: 'higher_education_plans', label: 'Higher Education Plans' }
      ]
    },
    {
      id: 'social',
      title: 'Social Media & Online Presence',
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      fields: [
        { key: 'github_url', label: 'GitHub Profile' },
        { key: 'twitter_url', label: 'Twitter Profile' },
        { key: 'linkedin_url', label: 'LinkedIn Profile' },
        { key: 'instagram_url', label: 'Instagram Profile' },
        // Extended social media fields
        { key: 'facebook_url', label: 'Facebook Profile' },
        { key: 'youtube_channel', label: 'YouTube Channel' },
        { key: 'portfolio_website', label: 'Portfolio Website' },
        { key: 'blog_url', label: 'Blog URL' },
        { key: 'stackoverflow_profile', label: 'Stack Overflow Profile' },
        { key: 'medium_profile', label: 'Medium Profile' },
        { key: 'behance_profile', label: 'Behance Profile' },
        { key: 'dribbble_profile', label: 'Dribbble Profile' },
        { key: 'kaggle_profile', label: 'Kaggle Profile' },
        { key: 'research_gate_profile', label: 'ResearchGate Profile' },
        { key: 'google_scholar_profile', label: 'Google Scholar Profile' }
      ]
    },
    {
      id: 'disciplinary',
      title: 'Disciplinary Records',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      fields: [
        // Disciplinary-related fields
        { key: 'disciplinary_actions', label: 'Disciplinary Actions' },
        { key: 'warnings_issued', label: 'Warnings Issued' },
        { key: 'suspension_details', label: 'Suspension Details' },
        { key: 'complaint_history', label: 'Complaint History' },
        { key: 'ragging_complaints', label: 'Ragging Complaints' },
        { key: 'misconduct_reports', label: 'Misconduct Reports' },
        { key: 'penalty_imposed', label: 'Penalty Imposed' },
        { key: 'disciplinary_remarks', label: 'Disciplinary Remarks' }
      ]
    },
    {
      id: 'alumni',
      title: 'Alumni Information',
      icon: <School className="h-5 w-5 text-purple-400" />,
      fields: [
        // Alumni-related fields
        { key: 'graduation_date', label: 'Graduation Date' },
        { key: 'degree_awarded', label: 'Degree Awarded' },
        { key: 'final_cgpa', label: 'Final CGPA' },
        { key: 'convocation_attendance', label: 'Convocation Attendance' },
        { key: 'alumni_association_member', label: 'Alumni Association Member' },
        { key: 'alumni_contributions', label: 'Alumni Contributions' },
        { key: 'current_organization', label: 'Current Organization' },
        { key: 'current_position', label: 'Current Position' },
        { key: 'current_location', label: 'Current Location' },
        { key: 'alumni_events_attended', label: 'Alumni Events Attended' },
        { key: 'alumni_feedback', label: 'Alumni Feedback' }
      ]
    }
  ], []);

  // Get all raw data from the student object
  const rawData = useMemo(() => {
    const entries = Object.entries(student)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        key,
        label: formatFieldLabel(key),
        value: formatValue(value)
      }));
      
    // Sort based on current sort order
    return sortOrder === 'asc' 
      ? entries.sort((a, b) => a.label.localeCompare(b.label))
      : entries.sort((a, b) => b.label.localeCompare(a.label));
  }, [student, sortOrder]);
  
  // Filter raw data based on search term
  const filteredRawData = useMemo(() => {
    if (!searchTerm) return rawData;
    
    const term = searchTerm.toLowerCase();
    return rawData.filter(item => 
      item.label.toLowerCase().includes(term) || 
      item.value.toLowerCase().includes(term)
    );
  }, [rawData, searchTerm]);

  // Personal Summary (for the Overview tab)
  const personalSummary = useMemo(() => {
    const { name, surname, email, rollno, registrationNo, gender, dob, nationality } = student;
    return [
      { label: 'Name', value: `${name || ''} ${surname || ''}`.trim() },
      { label: 'Email', value: email },
      { label: 'Roll Number', value: rollno },
      { label: 'Registration', value: registrationNo },
      { label: 'Gender', value: gender },
      { label: 'Date of Birth', value: dob },
      { label: 'Nationality', value: nationality }
    ].filter(item => item.value);
  }, [student]);

  // Academic Summary (for the Overview tab)
  const academicSummary = useMemo(() => {
    const { 
      admissionType, tenth_marks_obtained, tenth_out_of_marks, 
      twelfth_marks_obtained, twelfth_out_of_marks 
    } = student;
    
    return [
      { label: 'Admission Type', value: admissionType },
      { 
        label: '10th Marks', 
        value: tenth_marks_obtained && tenth_out_of_marks 
          ? `${tenth_marks_obtained}/${tenth_out_of_marks}` 
          : undefined 
      },
      { 
        label: '12th Marks', 
        value: twelfth_marks_obtained && twelfth_out_of_marks 
          ? `${twelfth_marks_obtained}/${twelfth_out_of_marks}` 
          : undefined 
      }
    ].filter(item => item.value);
  }, [student]);

  // Contact Summary (for the Overview tab)
  const contactSummary = useMemo(() => {
    const { mobileNo, address_permanant, city_village_permanant, state_permanant } = student;
    const address = [address_permanant, city_village_permanant, state_permanant]
      .filter(part => part)
      .join(', ');
      
    return [
      { label: 'Mobile', value: mobileNo },
      { label: 'Address', value: address }
    ].filter(item => item.value);
  }, [student]);

  // Export data functions
  const convertToCSV = (studentData: Student) => {
    const rows: string[] = [];
    
    // Add header row
    const headers = Object.keys(studentData).map(key => formatFieldLabel(key));
    rows.push(headers.join(','));
    
    // Add data row
    const values = Object.entries(studentData).map(([_, value]) => {
      // Handle different types of values
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    });
    
    rows.push(values.join(','));
    
    return rows.join('\n');
  };
  
  const exportAsCSV = () => {
    const csvContent = convertToCSV(student);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create filename with student name and ID
    const filename = `${student.name}_${student.surname || ''}_${student.id || 'data'}.csv`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportAsJSON = () => {
    const jsonContent = JSON.stringify(student, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create filename with student name and ID
    const filename = `${student.name}_${student.surname || ''}_${student.id || 'data'}.json`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const printData = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const studentName = `${student.name} ${student.surname || ''}`.trim();
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Student Information: ${studentName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
                color: #333;
              }
              .header {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
              }
              h1 {
                margin: 0;
                font-size: 24px;
                color: #0284c7;
              }
              .section {
                margin-bottom: 20px;
                break-inside: avoid;
              }
              .section-title {
                margin-top: 15px;
                margin-bottom: 10px;
                font-size: 18px;
                font-weight: bold;
                color: #0f172a;
                background-color: #f8fafc;
                padding: 8px;
                border-radius: 4px;
              }
              .fields {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
              }
              .field {
                margin-bottom: 8px;
                break-inside: avoid;
              }
              .field-label {
                display: block;
                font-size: 12px;
                font-weight: bold;
                color: #64748b;
              }
              .field-value {
                display: block;
                font-size: 14px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
              }
              @media print {
                body {
                  font-size: 12px;
                }
                .section-title {
                  font-size: 14px;
                }
                .fields {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Student Information: ${studentName}</h1>
              <p>ID: ${student.id || 'N/A'} | Email: ${student.email || 'N/A'} | Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="content">
      `);
      
      // Add each section that has data
      sections.forEach(section => {
        const fieldsWithValues = section.fields.filter(
          field => student[field.key as keyof Student] !== undefined && 
                   student[field.key as keyof Student] !== null
        );
        
        if (fieldsWithValues.length === 0) return;
        
        printWindow.document.write(`
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="fields">
        `);
        
        fieldsWithValues.forEach(field => {
          const value = student[field.key as keyof Student];
          printWindow.document.write(`
            <div class="field">
              <span class="field-label">${field.label}:</span>
              <span class="field-value">${formatValue(value)}</span>
            </div>
          `);
        });
        
        printWindow.document.write(`
            </div>
          </div>
        `);
      });
      
      printWindow.document.write(`
            </div>
            <div class="footer">
              Generated from Sherlock Student Database | ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Add slight delay to allow content to render
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-6" ref={printableRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold gradient-text">
          Student Information
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800">
            {Object.keys(student).filter(key => student[key as keyof Student] !== null && student[key as keyof Student] !== undefined).length} of 178 fields
          </Badge>
          <div className="ml-3 h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" 
              style={{ 
                width: `${(Object.keys(student).filter(key => student[key as keyof Student] !== null && student[key as keyof Student] !== undefined).length / 178) * 100}%` 
              }}
            ></div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportAsCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Export as JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={printData}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Print View</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 sm:grid-cols-5 lg:w-auto mb-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="organized" className="text-xs sm:text-sm">
            By Category
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All Fields
          </TabsTrigger>
          <TabsTrigger value="missing" className="text-xs sm:text-sm">
            Missing Data
          </TabsTrigger>
          <TabsTrigger value="json" className="text-xs sm:text-sm hidden sm:block">
            JSON
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Quick summary of key information */}
        <TabsContent value="overview" className="animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Overview */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 animate-cardEntrance" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Personal
                </h3>
              </div>
              <div className="space-y-3">
                {personalSummary.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.label}:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.value || 'Not provided'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Academic Overview */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 animate-cardEntrance" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Academic
                </h3>
              </div>
              <div className="space-y-3">
                {academicSummary.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.label}:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.value || 'Not provided'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Overview */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 animate-cardEntrance" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Contact
                </h3>
              </div>
              <div className="space-y-3">
                {contactSummary.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.label}:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {item.value || 'Not provided'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Data Completeness Indicator */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              Data Completeness
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.keys(student).filter(key => student[key as keyof Student] !== null && student[key as keyof Student] !== undefined).length} available fields
              </Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section) => {
                const availableFields = section.fields.filter(
                  field => student[field.key as keyof Student] !== undefined && 
                           student[field.key as keyof Student] !== null
                );
                const completionPercentage = section.fields.length 
                  ? Math.round((availableFields.length / section.fields.length) * 100) 
                  : 0;
                
                const statusColor = 
                  completionPercentage > 70 ? 'bg-emerald-500 text-emerald-50' :
                  completionPercentage > 30 ? 'bg-amber-500 text-amber-50' :
                  'bg-red-500 text-red-50';
                
                return (
                  <div key={section.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {section.icon}
                        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {section.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                          {completionPercentage}%
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-2">
                          {availableFields.length}/{section.fields.length}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          completionPercentage > 70 
                            ? 'bg-emerald-500' 
                            : completionPercentage > 30 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Organized Tab - All data organized by category */}
        <TabsContent value="organized" className="animate-fadeIn">
          <div className="mb-4 bg-slate-100 dark:bg-slate-800/50 px-4 py-3 rounded-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {sections.filter(section => {
                  const fieldsWithValues = section.fields.filter(
                    field => student[field.key as keyof Student] !== undefined && 
                            student[field.key as keyof Student] !== null
                  );
                  return fieldsWithValues.length > 0;
                }).length} categories with data
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => 
                  expandedSections.length === 0 
                    ? setExpandedSections(sections.map(s => s.id)) 
                    : setExpandedSections([])
                }
                className="text-xs flex items-center gap-1"
              >
                {expandedSections.length === 0 ? 'Expand All' : 'Collapse All'}
                {expandedSections.length === 0 ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {sections.map((section, idx) => {
              // Only show sections that have at least one field with a value
              const fieldsWithValues = section.fields.filter(
                field => student[field.key as keyof Student] !== undefined && 
                         student[field.key as keyof Student] !== null
              );
              
              if (fieldsWithValues.length === 0) return null;
              
              const isExpanded = expandedSections.includes(section.id);
              
              return (
                <div 
                  key={section.id} 
                  className="bg-slate-50 dark:bg-slate-800/30 rounded-lg overflow-hidden animate-cardEntrance"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center">
                      {section.icon}
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white ml-2">
                        {section.title}
                      </h3>
                      <Badge variant="outline" className="ml-3 text-xs">
                        {fieldsWithValues.length} fields
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                        {fieldsWithValues.map((field, j) => (
                          <div key={j} className="space-y-1 animate-popIn" style={{ animationDelay: `${0.02 * j}s` }}>
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              {field.label}:
                            </dt>
                            <dd className="text-sm font-medium text-slate-900 dark:text-white break-words">
                              {formatValue(student[field.key as keyof Student]) || 'Not provided'}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        {/* All Fields Tab - Searchable list of all data */}
        <TabsContent value="all" className="animate-fadeIn">
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  type="text" 
                  placeholder="Search all fields..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-xs flex items-center gap-1"
                >
                  <ArrowDownUp className="h-3.5 w-3.5" />
                  Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                  {filteredRawData.length} fields
                </div>
              </div>
            </div>
            
            {filteredRawData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                {filteredRawData.map((item, i) => (
                  <div key={i} className="space-y-1 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.label}:
                    </dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">No matching fields found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Missing Data Tab - Show fields with no data */}
        <TabsContent value="missing" className="animate-fadeIn">
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Filter className="h-5 w-5 mr-2 text-amber-500" />
                Missing Information
              </h3>
              <Badge variant="outline" className="text-xs">
                {
                  sections.reduce((total, section) => 
                    total + section.fields.filter(
                      field => student[field.key as keyof Student] === undefined || 
                               student[field.key as keyof Student] === null
                    ).length, 0)
                } missing fields
              </Badge>
            </div>
            
            {/* Organize missing fields by section */}
            <div className="space-y-5">
              {sections.map((section) => {
                const missingFields = section.fields.filter(
                  field => student[field.key as keyof Student] === undefined || 
                           student[field.key as keyof Student] === null
                );
                
                if (missingFields.length === 0) return null;
                
                // Calculate completion percentage for this section
                const completionPercentage = Math.round(
                  ((section.fields.length - missingFields.length) / section.fields.length) * 100
                );
                
                return (
                  <div key={section.id} className="mb-6 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {section.icon}
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 ml-2">
                          {section.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {completionPercentage}% complete
                        </span>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100 border-amber-200 dark:border-amber-800">
                          {missingFields.length} missing
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                      <div 
                        className={`h-1.5 rounded-full ${
                          completionPercentage > 70 
                            ? 'bg-emerald-500' 
                            : completionPercentage > 30 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {missingFields.map((field, j) => (
                        <div key={j} className="text-sm text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-md px-3 py-1.5 flex items-center">
                          <span className="truncate">{field.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        {/* JSON Tab - Raw JSON data */}
        <TabsContent value="json" className="animate-fadeIn">
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">
                Raw JSON Data
              </h3>
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                {Object.keys(student).length} properties
              </Badge>
            </div>
            <pre className="text-xs overflow-x-auto p-3 bg-slate-100 dark:bg-slate-800 rounded font-mono">
              {JSON.stringify(student, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 