import React from 'react';
import { Student } from '@/lib/supabase';

interface AllStudentInfoProps {
  student: Student;
}

export function AllStudentInfo({ student }: AllStudentInfoProps) {
  // Group fields into sections for better organization
  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Name', value: student.name },
        { label: 'Surname', value: student.surname },
        { label: 'Email', value: student.email },
        { label: 'Roll No', value: student.rollno },
        { label: 'Registration No', value: student.registrationNo },
        { label: 'Enrollment Number', value: student.enrollmentNumber },
        { label: 'Mobile Number', value: student.mobileNo },
        { label: 'Date of Birth', value: student.dob },
        { label: 'Gender', value: student.gender },
        { label: 'Nationality', value: student.nationality },
        { label: 'Blood Group', value: student.bloodGroup },
        { label: 'Marital Status', value: student.maritalStatus },
        { label: 'Religion', value: student.religion },
        { label: 'Category', value: student.category },
        { label: 'Sub-caste', value: student.subcast },
        { label: 'Aadhaar Number', value: student.adhaarNo },
        // Add physical attributes if available
        { label: 'Height', value: student.height },
        { label: 'Weight', value: student.weight },
        { label: 'Physically Handicapped', value: student.physically_handicapped },
        { label: 'Sport', value: student.sport_name },
      ]
    },
    {
      title: 'Family Information',
      fields: [
        { label: 'Father\'s Name', value: student.father_name },
        { label: 'Father\'s Occupation', value: student.occupation },
        { label: 'Mother\'s Name', value: student.motherName },
        { label: 'Mother\'s Occupation', value: student.motherOccupation },
        { label: 'Annual Family Income', value: student.annualFamilyIncome },
        { label: 'Social Category', value: student.socialCategory },
      ]
    },
    {
      title: 'Contact Information',
      fields: [
        { label: 'Permanent Address', value: student.address_permanant },
        { label: 'City/Village', value: student.city_village_permanant },
        { label: 'District', value: student.district_permanant },
        { label: 'State', value: student.state_permanant },
        { label: 'Local Address', value: student.address_local },
        { label: 'PIN Code', value: student.pin_local },
      ]
    },
    {
      title: 'Academic Information',
      fields: [
        { label: 'Admission Type', value: student.admissionType },
        { label: '10th Marks Obtained', value: student.tenth_marks_obtained },
        { label: '10th Total Marks', value: student.tenth_out_of_marks },
        { label: '12th Marks Obtained', value: student.twelfth_marks_obtained },
        { label: '12th Total Marks', value: student.twelfth_out_of_marks },
        { label: 'Diploma Marks', value: student.diploma_marks_obtained },
        { label: 'Entrance Exam Percentage', value: student.entrance_exam_percentage },
      ]
    },
    {
      title: 'Banking Details',
      fields: [
        { label: 'Bank Name', value: student.bank_name },
        { label: 'IFSC Code', value: student.ifsccode },
      ]
    }
  ];

  // Get all raw data from the student object
  const rawData = Object.entries(student).map(([key, value]) => ({
    key,
    value: value ? String(value) : '-'
  }));

  return (
    <div className="space-y-8">
      {/* Organized Sections */}
      <div className="space-y-6">
        {sections.map((section, i) => {
          // Only show sections that have at least one field with a value
          const fieldsWithValues = section.fields.filter(field => field.value);
          if (fieldsWithValues.length === 0) return null;
          
          return (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                {fieldsWithValues.map((field, j) => (
                  <div key={j} className="space-y-1">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {field.label}:
                    </dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white">
                      {field.value || 'Not provided'}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Raw Data */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            All Available Data
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">
            {rawData.length} fields
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {rawData.map((item, i) => (
            <div key={i} className="space-y-1">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.key}:
              </dt>
              <dd className="text-sm font-medium text-slate-900 dark:text-white break-words">
                {item.value}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 