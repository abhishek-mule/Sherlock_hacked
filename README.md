# Student PDF Data Extractor

A simplified tool to extract student data from PDF files and display it on a website.

## Overview

This project includes:
1. A FastAPI backend to extract student data from PDF files using OCR
2. A simple HTML frontend to display the extracted student data
3. Integration between the two via a REST API
4. **Search feature to find student details by name**

## Requirements

1. Python 3.8 or higher
2. Tesseract OCR (for text recognition)
3. Poppler (for PDF to image conversion)

## Installation

### 1. Install Tesseract OCR

For Windows:
1. Download and install Tesseract OCR from [Tesseract GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
2. Install to the default location: `C:\Program Files\Tesseract-OCR`
3. Add the installation directory to your PATH environment variable

### 2. Install Poppler

For Windows:
1. Download Poppler from [Poppler Releases](http://blog.alivate.com.au/poppler-windows/)
2. Extract to `C:\poppler`
3. Add `C:\poppler\bin` to your PATH environment variable

### 3. Install Python Dependencies

Run:
```bash
pip install -r requirements.txt
```

## Usage

### 1. Start the Backend Server

Run:
```bash
python pdf_extractor.py
```

This will start the API server at `http://localhost:8000`.

### 2. Open the Website

Open `website_example.html` in your web browser.

### 3. Extract Student Data from PDF

1. Click on the "Upload PDF" tab
2. Click "Choose PDF File" and select a PDF containing student information
3. The system will extract the student data and display it on the page
4. The extracted data is also automatically saved to a database for future searches

### 4. Search for Student Data

1. Click on the "Search Students" tab
2. Enter a student name (or part of a name) in the search box
3. Click "Search" to find matching student records
4. Click on a search result to view detailed student information
5. All data from the PDF will be displayed in the detailed view

## Troubleshooting

### Connection Issues

If you see "Failed to fetch" or connection errors:

1. **Check if the API server is running**
   - Make sure you've started the server with `python pdf_extractor.py`
   - The terminal should show "Starting API server at http://localhost:8000"

2. **Check server status in the web interface**
   - The website now has a status indicator showing if the API is reachable
   - If it shows "Offline", check that the server is running

3. **CORS Issues**
   - If opening the HTML file directly from your file system, some browsers block API calls
   - Solution 1: Use a local web server to serve the HTML file:
     ```bash
     python -m http.server 8080
     ```
     Then access the website at http://localhost:8080/website_example.html
     
   - Solution 2: Use a browser with less strict CORS when developing locally (like Firefox)

4. **Change API URL**
   - If your server is running on a different port or host, use the API settings section
   - Enter the correct URL and click "Save Settings"

### PDF Processing Issues

1. **No data extracted**
   - Make sure the PDF contains text (not just images)
   - Check that the PDF format matches the expected patterns in the code
   - You may need to customize the regex patterns for your specific documents

2. **Tesseract OCR issues**
   - Verify Tesseract is correctly installed and in your PATH
   - Try running Tesseract manually on an image to check if it works

### Search Issues

1. **No search results**
   - Verify that you've previously uploaded PDFs with student data
   - The search is case-insensitive and supports partial matches
   - Check the student_database.json file to see if it contains any records

2. **Database not updating**
   - Make sure the application has write permissions in the directory
   - Check for errors in the server logs

## Customizing Student Data Extraction

You can customize which fields are extracted by modifying the regex patterns in `pdf_extractor.py`. The current patterns look for:

- Student ID
- Name
- Date of Birth
- Course/Program
- Grade/GPA
- Email

If your PDF documents have a different format, update the `STUDENT_PATTERNS` dictionary with patterns that match your documents.

## Integration with Your Existing Website

To integrate this functionality with your existing website:

1. Add the HTML and JavaScript from `website_example.html` to your website
2. Ensure your website can make API calls to the backend server
3. Update the fetch URL in the JavaScript to point to your API server

## Notes

- This is a simplified version that uses Tesseract OCR for text extraction
- For better accuracy with complex documents, consider fine-tuning the extraction patterns
- The temporary files are automatically cleaned up after processing
- Student data is stored in student_database.json for persistent storage and searching
