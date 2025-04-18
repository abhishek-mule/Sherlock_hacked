# PDF Student Search Integration Guide

This guide explains how to integrate the PDF student search feature into your main project.

## Overview

The PDF student search feature allows you to:

1. Search for students by name in your PDF database
2. View student information extracted from PDF documents
3. Access all details from the original PDF in a structured format

## Prerequisites

1. You need the backend API server running:
   - The `pdf_extractor.py` file must be running on a server
   - Default URL is http://localhost:8000

2. Tesseract OCR and Poppler must be properly installed and configured

## Integration Steps

### 1. Add the JavaScript File

Copy the `student-search-integration.js` file to your project's JavaScript directory.

```bash
cp student-search-integration.js /path/to/your/project/js/
```

### 2. Include the Script in Your HTML

Add the script to your HTML page(s) where you want to use the PDF search feature:

```html
<script src="js/student-search-integration.js"></script>
```

### 3. Create Container Elements

Add these three container divs to your HTML where you want the search feature to appear:

```html
<!-- PDF Search Component containers -->
<div id="pdf-student-search"></div>
<div id="pdf-search-results"></div>
<div id="pdf-student-details" style="display: none;"></div>
```

You can customize the IDs if needed.

### 4. Initialize the Component

Initialize the search component in your JavaScript:

```javascript
// Create an instance of the StudentPdfSearch class
const pdfSearch = new StudentPdfSearch({
    // Options (all optional)
    apiUrl: 'http://localhost:8000', // Change if your API is at a different URL
    searchContainerId: 'pdf-student-search', // ID of the search form container
    resultsContainerId: 'pdf-search-results', // ID of the results container
    detailsContainerId: 'pdf-student-details', // ID of the details container
    onStudentSelect: function(student) {
        // Custom callback when a student is selected
        console.log('Student selected:', student);
        // You can perform additional actions here
    }
});

// Initialize the component
pdfSearch.init();
```

## Configuration Options

The `StudentPdfSearch` constructor accepts these options:

| Option | Default | Description |
|--------|---------|-------------|
| apiUrl | 'http://localhost:8000' | URL of the PDF API server |
| searchContainerId | 'pdf-student-search' | ID of the search form container |
| resultsContainerId | 'pdf-search-results' | ID of the results container |
| detailsContainerId | 'pdf-student-details' | ID of the details container |
| onStudentSelect | null | Callback function when a student is selected |

## API Methods

The `StudentPdfSearch` class provides these methods:

| Method | Description |
|--------|-------------|
| init() | Initialize the component |
| checkApiStatus() | Check if the API is accessible |
| searchStudents() | Perform a search with the current input value |
| displaySearchResults(data) | Display search results |
| displayStudentDetails(student) | Display detailed student information |

## Testing with Postman or Thunder Client

You can test the API endpoints directly using Postman or Thunder Client:

### 1. Health Check

- **Method**: GET
- **URL**: http://localhost:8000/health
- **Expected Response**: 
  ```json
  {
    "status": "ok"
  }
  ```

### 2. Search Students

- **Method**: GET
- **URL**: http://localhost:8000/search-students/?name=John
- **Expected Response**: 
  ```json
  {
    "status": "success",
    "query": "John",
    "count": 1,
    "results": [
      {
        "name": "John Smith",
        "student_id": "S12345",
        "course": "Computer Science",
        "source_file": "student_records.pdf",
        "extraction_time": "2023-07-15T14:22:33.123456"
      }
    ]
  }
  ```

## Example Usage in React

If you're using React, you can create a wrapper component:

```jsx
import React, { useEffect, useRef } from 'react';

// Assume the script is included in your HTML or imported
// import 'path/to/student-search-integration.js';

function PdfStudentSearch() {
  const searchRef = useRef(null);
  
  useEffect(() => {
    // Make sure the script is loaded
    if (window.StudentPdfSearch) {
      const pdfSearch = new window.StudentPdfSearch({
        apiUrl: 'http://localhost:8000',
        onStudentSelect: (student) => {
          console.log('Student selected in React:', student);
        }
      });
      
      searchRef.current = pdfSearch;
      pdfSearch.init();
    }
    
    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);
  
  return (
    <div className="pdf-search-container">
      <h2>Search Student PDFs</h2>
      <div id="pdf-student-search"></div>
      <div id="pdf-search-results"></div>
      <div id="pdf-student-details" style={{ display: 'none' }}></div>
    </div>
  );
}

export default PdfStudentSearch;
```

## Troubleshooting

### API Connection Issues

If you see "PDF API Disconnected" in the status:

1. Make sure the API server is running: `python pdf_extractor.py`
2. Check that the API URL is correct in your configuration
3. Verify there are no CORS issues (especially in development)

### No Search Results

If searches return no results:

1. Make sure you've uploaded and processed PDF files with the API first
2. Check the `student_database.json` file to see if it contains records
3. Try searching with a different or more general term

### Custom Styling

The component includes its own CSS styles. If you need to customize them:

1. You can override the styles in your own CSS file
2. Or modify the `addStyles` function in the JavaScript file

## Further Customization

If you need to modify how the student data is displayed:

1. The `displaySearchResults` and `displayStudentDetails` methods can be overridden
2. You can add custom fields to the `propertyOrder` array in `displayStudentDetails`

For any other customization needs, modify the JavaScript file directly. 