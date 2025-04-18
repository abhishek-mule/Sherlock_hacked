import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const supabase = createClient();
    
    // First get the admission data
    const { data: admissionData, error: admissionError } = await supabase
      .from('admission_data')
      .select('*')
      .eq('id', id)
      .single();
    
    if (admissionError) {
      console.error('Error fetching admission data:', admissionError);
      return NextResponse.json(
        { error: 'Failed to fetch admission data' },
        { status: 500 }
      );
    }
    
    if (!admissionData) {
      return NextResponse.json(
        { error: 'Admission data not found' },
        { status: 404 }
      );
    }
    
    // Check if we need to fetch related student data
    if (admissionData.application_id) {
      // Try to find related student data by application_id
      const { data: studentData, error: studentError } = await supabase
        .from('student_data')
        .select('*')
        .eq('application_id', admissionData.application_id)
        .maybeSingle();
      
      if (!studentError && studentData) {
        // If found, return combined data
        return NextResponse.json({
          ...admissionData,
          student_details: studentData
        });
      }
      
      // If no related student data found or error occurred, just return admission data
      if (studentError) {
        console.warn('Error fetching student data:', studentError);
      }
    }
    
    // Return just the admission data if no student data available
    return NextResponse.json(admissionData);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 