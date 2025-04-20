import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { convertDbColumnToCamelCase } from '@/lib/utils';

/**
 * API endpoint for fetching detailed student data
 * This endpoint accepts id, email, or name+surname parameters to fetch a student
 * It returns all fields available in the student_data table
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const surname = searchParams.get('surname');
    
    // Must have at least one search parameter
    if (!id && !email && !(name && surname)) {
      return NextResponse.json(
        { error: 'At least one search parameter (id, email, or name+surname) is required' },
        { status: 400 }
      );
    }
    
    // Try all possible ways to find the student
    let data;
    let error;
    
    // 1. Try ID first if provided
    if (id) {
      const { data: idData, error: idError } = await supabase
        .from('student_data')
        .select('*')
        .eq('SRNO', id)
        .maybeSingle();
        
      if (!idError && idData) {
        data = idData;
      } else {
        error = idError;
      }
    }
    
    // 2. Try email if no data yet
    if (!data && email) {
      const { data: emailData, error: emailError } = await supabase
        .from('student_data')
        .select('*')
        .eq('EMAILID', email)
        .maybeSingle();
        
      if (!emailError && emailData) {
        data = emailData;
      } else if (!error) {
        error = emailError;
      }
    }
    
    // 3. Try name+surname if no data yet
    if (!data && name && surname) {
      // First try FIRSTNAME + LAST NAME
      const { data: nameData, error: nameError } = await supabase
        .from('student_data')
        .select('*')
        .eq('FIRSTNAME', name)
        .eq('LAST NAME', surname)
        .maybeSingle();
        
      if (!nameError && nameData) {
        data = nameData;
      } else {
        // Try full NAME
        const fullName = `${name} ${surname}`;
        const { data: fullNameData, error: fullNameError } = await supabase
          .from('student_data')
          .select('*')
          .eq('NAME', fullName)
          .maybeSingle();
          
        if (!fullNameError && fullNameData) {
          data = fullNameData;
        } else if (!error) {
          error = fullNameError || nameError;
        }
      }
    }
    
    // Return 404 if no data found
    if (!data) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Convert to a consistent format with camelCase keys
    const formattedData = Object.entries(data).reduce((acc, [key, value]) => {
      const camelKey = convertDbColumnToCamelCase(key);
      acc[camelKey] = value;
      return acc;
    }, {} as Record<string, any>);
    
    // Return the formatted data
    return NextResponse.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('Error in student details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 