import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // If fewer than 8 pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first and last page
    const pages = [1, totalPages];
    
    // Add current page and surrounding pages
    const surroundingPages = [
      Math.max(2, currentPage - 1),
      currentPage,
      Math.min(totalPages - 1, currentPage + 1)
    ];
    
    // Filter and sort all pages
    return [...new Set([...pages, ...surroundingPages])]
      .filter(p => p > 0 && p <= totalPages)
      .sort((a, b) => a - b);
  };
  
  const pageNumbers = generatePagination();
  
  const renderPageButton = (pageNumber: number, index: number) => {
    // Insert ellipsis if there's a gap in page numbers
    if (index > 0 && pageNumber > pageNumbers[index - 1] + 1) {
      return (
        <React.Fragment key={`ellipsis-${pageNumber}`}>
          <div className="flex items-center justify-center h-10 w-10">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            className="h-10 w-10"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        </React.Fragment>
      );
    }
    
    return (
      <Button
        key={pageNumber}
        variant={pageNumber === currentPage ? "default" : "outline"}
        className="h-10 w-10"
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    );
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="h-10 w-10 p-0"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map(renderPageButton)}
      
      <Button
        variant="outline"
        className="h-10 w-10 p-0"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
