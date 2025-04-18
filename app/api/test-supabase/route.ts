import { NextResponse } from 'next/server';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test direct connection without using the server utility
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    console.log('Testing Supabase connection with:', { 
      url: supabaseUrl,
      keyLength: supabaseKey ? supabaseKey.length : 0
    });
    
    const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);
    
    // Simple test query
    const { data, error } = await supabase
      .from('admission_data')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.error('Supabase test error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data
    });
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 