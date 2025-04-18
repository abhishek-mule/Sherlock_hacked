import { NextRequest, NextResponse } from 'next/server';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const sortBy = searchParams.get('sortBy') || 'sr_no';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  
  const offset = (page - 1) * pageSize;
  
  console.log('Starting admission data search:', { search, page, pageSize, sortBy, sortOrder, offset });
  
  try {
    // Direct Supabase client initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    
    const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created directly');
    
    // Build more flexible search conditions
    let filterConditions = [];
    
    if (search) {
      // Add the standard search on full fields
      filterConditions.push(
        `full_name.ilike.%${search}%`,
        `application_id.ilike.%${search}%`,
        `branch.ilike.%${search}%`,
        `college.ilike.%${search}%`,
        `category.ilike.%${search}%`
      );
      
      // Split search terms to handle names in different orders
      const searchTerms = search.trim().split(/\s+/);
      if (searchTerms.length > 1) {
        // If we have multiple terms, create conditions for each term
        searchTerms.forEach(term => {
          if (term.length > 2) { // Only consider terms with at least 3 characters
            filterConditions.push(`full_name.ilike.%${term}%`);
          }
        });
      }
    }
    
    const filterString = filterConditions.join(',');
    console.log('Using filter string:', filterString);
    
    // Execute query with all parameters in one call
    let query = supabase
      .from('admission_data')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Only add OR filter if we have search terms
    if (filterString) {
      query = query.or(filterString);
    }
    
    // Apply pagination
    const { data, error, count } = await query.range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch admission data', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    const totalPages = count ? Math.ceil(count / pageSize) : 0;
    console.log('Search completed successfully, found records:', count || 0);
    
    return NextResponse.json({
      data: data || [],
      metadata: {
        total: count || 0,
        page,
        pageSize,
        totalPages
      }
    });
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 