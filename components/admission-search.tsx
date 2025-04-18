"use client";

import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

export default function AdmissionSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('sr_no');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch data with current filters
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/admission?${queryParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.details || data.error || 'Failed to fetch data');
      }
      
      setResults(data.data || []);
      setTotalPages(data.metadata?.totalPages || 1);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search when button is clicked
  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchData();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handle row click to view student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  // Fetch data when page, pageSize, sortBy, or sortOrder changes
  useEffect(() => {
    fetchData();
  }, [page, pageSize, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Admission Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, application ID, branch, or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <div className="mt-2 text-sm">
                    <p>{error}</p>
                    <p className="mt-2">
                      <strong>Possible fixes:</strong>
                    </p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Check your Supabase connection</li>
                      <li>Verify the admission_data table exists in your database</li>
                      <li>Make sure you've imported data into the table</li>
                      <li>Try refreshing the page or restarting the server</li>
                    </ul>
                    
                    <p className="mt-4">
                      <a 
                        href="/setup-guide" 
                        className="text-blue-600 hover:underline font-medium flex items-center"
                      >
                        View Setup Guide
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M14 5l7 7m0 0l-7 7m7-7H3" 
                          />
                        </svg>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Search Results</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(parseInt(value))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('sr_no')}
                  >
                    Sr No
                    {sortBy === 'sr_no' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('merit_no')}
                  >
                    Merit No
                    {sortBy === 'merit_no' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('application_id')}
                  >
                    Application ID
                    {sortBy === 'application_id' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('full_name')}
                  >
                    Full Name
                    {sortBy === 'full_name' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('branch')}
                  >
                    Branch
                    {sortBy === 'branch' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('college')}
                  >
                    College
                    {sortBy === 'college' && (
                      sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((student) => (
                  <TableRow 
                    key={student.id}
                    onClick={() => viewStudentDetails(student)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell>{student.sr_no}</TableCell>
                    <TableCell>{student.merit_no}</TableCell>
                    <TableCell>{student.application_id}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell>{student.college}</TableCell>
                    <TableCell>{student.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="flex items-center justify-center p-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </Card>
      ) : searchQuery && !loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No results found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Student Details */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedStudent.full_name} - Detailed Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-muted-foreground">Application ID:</p>
                  <p>{selectedStudent.application_id}</p>
                  
                  <p className="text-muted-foreground">Full Name:</p>
                  <p>{selectedStudent.full_name}</p>
                  
                  <p className="text-muted-foreground">Gender:</p>
                  <p>{selectedStudent.gender}</p>
                  
                  <p className="text-muted-foreground">Category:</p>
                  <p>{selectedStudent.category}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Academic Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-muted-foreground">Merit Number:</p>
                  <p>{selectedStudent.merit_no}</p>
                  
                  <p className="text-muted-foreground">MHT-CET Score:</p>
                  <p>{selectedStudent.mht_cet_score}</p>
                  
                  <p className="text-muted-foreground">Branch:</p>
                  <p>{selectedStudent.branch}</p>
                  
                  <p className="text-muted-foreground">College:</p>
                  <p>{selectedStudent.college}</p>
                  
                  <p className="text-muted-foreground">Seat Type:</p>
                  <p>{selectedStudent.seat_type}</p>
                  
                  <p className="text-muted-foreground">City:</p>
                  <p>{selectedStudent.city}</p>
                  
                  <p className="text-muted-foreground">Status:</p>
                  <p>{selectedStudent.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 