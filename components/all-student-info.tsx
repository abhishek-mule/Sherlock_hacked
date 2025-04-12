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
      title: 'Academic Information',
      fields: [
        { label: 'Admission Type', value: student.admissionType },
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
        {sections.map((section, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
              {section.fields.filter(field => field.value).map((field, j) => (
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
        ))}
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

      {/* Extended Database Schema Fields */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          Additional Database Fields
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The following fields exist in the database schema but may not have data for this student.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Academic Records</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>tenth_marks_obtained</li>
              <li>tenth_out_of_marks</li>
              <li>twelfth_marks_obtained</li>
              <li>twelfth_out_of_marks</li>
              <li>diploma_marks_obtained</li>
              <li>entrance_exam_percentage</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Contact Information</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>address_permanant</li>
              <li>city_village_permanant</li>
              <li>district_permanant</li>
              <li>state_permanant</li>
              <li>address_local</li>
              <li>pin_local</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Other Details</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>physically_handicapped</li>
              <li>height</li>
              <li>weight</li>
              <li>bank_name</li>
              <li>ifsccode</li>
              <li>sport_name</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 