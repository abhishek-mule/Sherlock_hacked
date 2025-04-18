from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from typing import List, Dict, Any, Optional
import pytesseract
import re
import os
import subprocess
from PIL import Image
import logging
import json
import io
import tempfile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# First try to import PyMuPDF for PDF processing
try:
    import fitz  # PyMuPDF
    USE_PYMUPDF = True
    logger.info("Using PyMuPDF for PDF processing")
except ImportError:
    USE_PYMUPDF = False
    logger.warning("PyMuPDF not found, will try to use Poppler")

# Try to import additional PDF analysis libraries
try:
    import cv2
    import numpy as np
    import pandas as pd
    from PIL import Image
    HAS_CV2 = True
    logger.info("OpenCV is available for advanced image processing")
except ImportError:
    HAS_CV2 = False
    logger.warning("OpenCV not found, some advanced image features will be limited")

# Try to import table extraction libraries
try:
    import tabula
    import camelot
    HAS_TABLE_EXTRACTION = True
    logger.info("Table extraction libraries available")
except ImportError:
    HAS_TABLE_EXTRACTION = False
    logger.warning("Table extraction libraries not found, table extraction will be limited")

# Initialize FastAPI
app = FastAPI(title="Student PDF Data Extractor")

# Configure CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Configure Tesseract path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
try:
    from shutil import which
    if which(TESSERACT_PATH) is None:
        logger.warning(f"Tesseract OCR not found at {TESSERACT_PATH}")
        logger.warning("Please install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki")
        # Try to find tesseract in PATH
        tesseract_in_path = which("tesseract")
        if tesseract_in_path:
            TESSERACT_PATH = tesseract_in_path
            logger.info(f"Found Tesseract in PATH: {TESSERACT_PATH}")
    
    # Set tesseract path
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
except Exception as e:
    logger.warning(f"Could not check Tesseract installation: {str(e)}")
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# Patterns to match common student data fields
STUDENT_PATTERNS = {
    # More flexible student ID patterns
    "student_id": r"(?:Student\s*ID|ID\s*Number|Roll\s*No|Application\s*No|Registration\s*No)[:\.\s]+([A-Za-z0-9-_\/]+)",
    
    # More comprehensive name patterns
    "name": r"(?:Student\s*Name|Name\s*of\s*the\s*Student|Candidate\s*Name|Full\s*Name|Name)[:\.\s]+([A-Za-z\s\.\-\']+)",
    
    # Additional name pattern for "Name:" format
    "name_alt": r"Name\s*[:\.]\s*([A-Za-z\s\.\-\']+)(?:\r|\n|$)",
    
    # First name, last name separate patterns
    "first_name": r"(?:First\s*Name)[:\.\s]+([A-Za-z\s]+)",
    "last_name": r"(?:Last\s*Name|Surname)[:\.\s]+([A-Za-z\s]+)",
    
    # Date of birth patterns
    "dob": r"(?:Date\s*of\s*Birth|DOB|Birth\s*Date)[:\.\s]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})",
    "dob_alt": r"(?:Date\s*of\s*Birth|DOB|Birth\s*Date)[:\.\s]+(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})",  # yyyy-mm-dd format
    
    # Course/program patterns
    "course": r"(?:Course|Program|Degree|Branch)[:\.\s]+([A-Za-z0-9\s\(\)&\.\-\/]+)",
    
    # Grade patterns
    "grade": r"(?:Grade|CGPA|GPA|Percentage)[:\.\s]+([\d\.]+|[A-F][+-]?|[\d\.]+\s*\%)",
    
    # Email patterns
    "email": r"(?:Email|E-mail|Email\s*Address)[:\.\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
    
    # Phone number patterns
    "phone": r"(?:Phone|Mobile|Contact|Tel|Telephone)[:\.\s]+((?:\+\d{1,3}[-\.\s]?)?\(?\d{3}\)?[-\.\s]?\d{3}[-\.\s]?\d{4})",
    
    # Address patterns
    "address": r"(?:Address|Permanent\s*Address|Residential\s*Address)[:\.\s]+([A-Za-z0-9\s\.\,\-\/\#\(\)]+)",
    
    # Gender patterns
    "gender": r"(?:Gender|Sex)[:\.\s]+([A-Za-z]+)",
    
    # Category/caste patterns
    "category": r"(?:Category|Caste|Social\s*Category)[:\.\s]+([A-Za-z\s]+)",
    
    # Father's name patterns
    "father_name": r"(?:Father\'s\s*Name|Father\s*Name)[:\.\s]+([A-Za-z\s\.]+)",
    
    # Mother's name patterns
    "mother_name": r"(?:Mother\'s\s*Name|Mother\s*Name)[:\.\s]+([A-Za-z\s\.]+)",
    
    # Academic year pattern
    "academic_year": r"(?:Academic\s*Year|Year)[:\.\s]+(\d{4}\s*[-\/]\s*\d{2,4}|\d{4})"
}

# Storage for extracted student data
STUDENT_DATABASE = []
STUDENT_DATABASE_FILE = "student_database.json"

# Load existing student database if it exists
def load_student_database():
    global STUDENT_DATABASE
    try:
        if os.path.exists(STUDENT_DATABASE_FILE):
            with open(STUDENT_DATABASE_FILE, 'r') as f:
                STUDENT_DATABASE = json.load(f)
                logger.info(f"Loaded {len(STUDENT_DATABASE)} student records from database")
    except Exception as e:
        logger.error(f"Error loading student database: {str(e)}")
        STUDENT_DATABASE = []

# Save student database
def save_student_database():
    try:
        with open(STUDENT_DATABASE_FILE, 'w') as f:
            json.dump(STUDENT_DATABASE, f, indent=2)
            logger.info(f"Saved {len(STUDENT_DATABASE)} student records to database")
    except Exception as e:
        logger.error(f"Error saving student database: {str(e)}")

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Add a root endpoint
@app.get("/")
async def root():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PDF Extractor API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .endpoint h2 { margin-top: 0; }
            form { margin-top: 20px; }
            input[type="file"] { margin: 10px 0; }
            input[type="submit"] { padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
            .note { font-size: 14px; color: #666; margin-top: 5px; }
        </style>
    </head>
    <body>
        <h1>PDF Extractor API</h1>
        <p>This API extracts student data from PDF files using OCR.</p>
        
        <div class="endpoint">
            <h2>Test PDF Upload</h2>
            <form action="/extract-student-data/" method="post" enctype="multipart/form-data">
                <label for="file">Select PDF file:</label><br>
                <input type="file" id="file" name="file" accept=".pdf"><br>
                <input type="submit" value="Upload and Process">
                <p class="note">Note: This form is for testing only. In production, use the API endpoint directly.</p>
            </form>
        </div>
        
        <div class="endpoint">
            <h2>Available Endpoints</h2>
            <ul>
                <li><strong>/health</strong> - Check API health status (GET)</li>
                <li><strong>/extract-student-data/</strong> - Upload and process PDF files (POST)</li>
                <li><strong>/search-students/?name=QUERY</strong> - Search for students by name (GET)</li>
            </ul>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

def convert_pdf_to_images(pdf_path: str, output_dir: str) -> List[str]:
    """Convert PDF to images using PyMuPDF or poppler"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Try using PyMuPDF first if available
    if USE_PYMUPDF:
        try:
            logger.info(f"Using PyMuPDF to convert {pdf_path} to images")
            pdf_document = fitz.open(pdf_path)
            image_files = []
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document.load_page(page_num)
                
                # Set a higher resolution for better OCR results (300 DPI)
                pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))
                image_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
                pix.save(image_path)
                image_files.append(image_path)
            
            logger.info(f"Successfully converted PDF using PyMuPDF. Generated {len(image_files)} images.")
            return image_files
        
        except Exception as e:
            logger.error(f"PyMuPDF conversion error: {str(e)}")
            if not USE_PYMUPDF:
                # If we're here and USE_PYMUPDF is False, we don't have a fallback
                raise Exception(f"PDF conversion failed: {str(e)}")
    
    # Fallback to poppler if PyMuPDF failed or is not available
    logger.info("Attempting to use Poppler for PDF conversion")
    output_prefix = os.path.join(output_dir, "page")
    
    try:
        # Try multiple possible poppler paths
        poppler_paths = [
            "C:/poppler/bin/pdftoppm",
            "C:/poppler/poppler-24.08.0/Library/bin/pdftoppm",
            "C:/Program Files/poppler/bin/pdftoppm",
            "C:/Program Files (x86)/poppler/bin/pdftoppm",
            "/usr/bin/pdftoppm",  # Linux
            "/usr/local/bin/pdftoppm"  # macOS
        ]
        
        success = False
        error_messages = []
        
        for poppler_path in poppler_paths:
            try:
                command = f'"{poppler_path}" -jpeg "{pdf_path}" "{output_prefix}"'
                logger.info(f"Attempting PDF conversion with command: {command}")
                subprocess.run(command, shell=True, check=True, capture_output=True)
                success = True
                logger.info(f"Successfully converted PDF using {poppler_path}")
                break
            except subprocess.CalledProcessError as e:
                error_msg = f"Failed with {poppler_path}: {e.stderr.decode()}"
                logger.warning(error_msg)
                error_messages.append(error_msg)
                continue
        
        if not success:
            raise Exception(f"PDF conversion failed with all paths. Errors: {'; '.join(error_messages)}")
        
        # Get the list of generated image files
        image_files = [os.path.join(output_dir, f) for f in os.listdir(output_dir) 
                       if f.startswith("page") and f.endswith((".jpg", ".png"))]
        image_files.sort()
        
        if not image_files:
            raise Exception("PDF conversion did not produce any images")
        
        logger.info(f"Generated {len(image_files)} images from PDF")
        return image_files
    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise Exception(f"PDF conversion failed: {str(e)}")

def extract_text_from_image(image_path: str) -> str:
    """Extract text from image using Tesseract OCR"""
    
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        
        # Log a sample of the extracted text for debugging
        if text:
            text_sample = text[:200].replace('\n', ' ').strip()
            logger.info(f"Text sample from {image_path}: '{text_sample}...'")
            
            # Look for potential field:value patterns to help with regex tuning
            find_potential_data_fields(text, image_path)
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image {image_path}: {str(e)}")
        return ""

def find_potential_data_fields(text: str, source: str):
    """Analyze text to find potential data fields for regex pattern development"""
    
    # Look for lines containing common field:value separators
    potential_fields = []
    
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        # Check for lines with common separators like ":", "=" 
        if ':' in line or '=' in line:
            # Split only on first occurrence of separator
            parts = line.split(':', 1) if ':' in line else line.split('=', 1)
            if len(parts) == 2:
                field = parts[0].strip()
                value = parts[1].strip()
                
                # Only consider fields with reasonable names and values
                if field and value and len(field) < 50 and len(value) < 100:
                    potential_fields.append((field, value))
    
    # Log potential fields if found
    if potential_fields:
        logger.info(f"Found {len(potential_fields)} potential data fields in {source}")
        for field, value in potential_fields[:5]:  # Limit to first 5 for brevity
            logger.info(f"  Potential field: '{field}' => '{value}'")

def extract_student_data(text: str) -> Dict[str, Any]:
    """Extract student data using regex patterns"""
    
    student_data = {}
    
    # Special case for name_alt pattern - if found, use it for name and remove name_alt
    name_alt_match = re.search(STUDENT_PATTERNS.get("name_alt", ""), text, re.IGNORECASE)
    if name_alt_match:
        student_data["name"] = name_alt_match.group(1).strip()
    
    # Try to extract first and last name if separate
    first_name_match = re.search(STUDENT_PATTERNS.get("first_name", ""), text, re.IGNORECASE)
    last_name_match = re.search(STUDENT_PATTERNS.get("last_name", ""), text, re.IGNORECASE)
    
    if first_name_match and last_name_match:
        first_name = first_name_match.group(1).strip()
        last_name = last_name_match.group(1).strip()
        # Construct full name if both first and last name are found
        student_data["name"] = f"{first_name} {last_name}"
    
    # Process all other standard patterns
    for field, pattern in STUDENT_PATTERNS.items():
        # Skip already processed special patterns
        if field in ["name_alt", "first_name", "last_name"]:
            continue
            
        # Skip name if already found via alternate methods
        if field == "name" and "name" in student_data:
            continue
            
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            
            # Skip excessively long values that are likely incorrect matches
            if len(value) > 100:
                logger.warning(f"Skipping suspiciously long value for {field}: {value[:50]}...")
                continue
                
            # Skip values that appear to be complete sentences rather than data fields
            if len(value.split()) > 10 and field not in ["address"]:
                logger.warning(f"Skipping value that appears to be a sentence for {field}: {value[:50]}...")
                continue
                
            student_data[field] = value
    
    # Post-processing: clean up extracted data
    
    # Don't allow "Candidate" or "Student" as standalone names - likely incorrect matches
    if "name" in student_data and student_data["name"].lower() in ["candidate", "student", "the candidate", "the student"]:
        del student_data["name"]
    
    # For date of birth, try alternative format if first attempt failed
    if "dob" not in student_data and "dob_alt" in STUDENT_PATTERNS:
        dob_alt_match = re.search(STUDENT_PATTERNS["dob_alt"], text, re.IGNORECASE)
        if dob_alt_match:
            student_data["dob"] = dob_alt_match.group(1).strip()
    
    # Log what we found for debugging
    if student_data:
        found_fields = ", ".join(f"{k}='{v}'" for k, v in student_data.items())
        logger.info(f"Extracted student data fields: {found_fields}")
    
    return student_data

@app.post("/extract-student-data/")
async def extract_student_data_from_pdf(file: UploadFile = File(...)):
    """Extract student data from PDF file"""
    
    try:
        # Save uploaded file temporarily
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        logger.info(f"File saved temporarily at: {file_location}")
        
        # Create temp directory for images
        temp_dir = "temp_output"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Convert PDF to images
        image_files = convert_pdf_to_images(file_location, temp_dir)
        
        # Process each page
        all_data = []
        student_data = {}
        all_extracted_students = []  # For multiple student records
        page_data_map = {}  # Map of page numbers to extracted data
        
        for idx, image_path in enumerate(image_files):
            page_num = idx + 1
            logger.info(f"Processing page {page_num}")
            
            # Extract text from image
            text = extract_text_from_image(image_path)
            
            # Extract student data
            page_data = extract_student_data(text)
            
            # Store page data for reference
            if page_data:
                page_data_map[page_num] = page_data
                
                # Add to comprehensive record
                all_data.append({
                    "page": page_num,
                    "data": page_data
                })
            
            # Detect if this is a new student record
            # If we find a name and substantial data, and either:
            # 1. We don't have a current student record
            # 2. This appears to be a different student from our current record
            is_new_student = False
            if "name" in page_data and len(page_data) >= 3:
                if not student_data:
                    is_new_student = True
                elif "name" in student_data and student_data["name"] != page_data["name"]:
                    # Different name, likely a different student
                    is_new_student = True
            
            if is_new_student and student_data:
                # Save the previous student before starting a new one
                if "name" in student_data:
                    logger.info(f"Completed student record for: {student_data['name']}")
                    all_extracted_students.append(student_data.copy())
                student_data = page_data
            else:
                # Merge data with existing record
                student_data.update(page_data)
        
        # Save the last student if we have one
        if student_data and "name" in student_data:
            all_extracted_students.append(student_data.copy())
            logger.info(f"Completed student record for: {student_data['name']}")
        
        # Process extracted students
        added_count = 0
        updated_count = 0
        
        for student in all_extracted_students:
            if not student or "name" not in student or not student["name"]:
                logger.warning(f"Skipping student record without name: {student}")
                continue
                
            # Add source file information
            student["source_file"] = file.filename
            student["extraction_time"] = import_time
            
            # Check if this student is already in database (by name)
            existing_index = next((i for i, s in enumerate(STUDENT_DATABASE) 
                                  if s.get("name", "").lower() == student["name"].lower()), -1)
            
            if existing_index >= 0:
                # Update existing record
                STUDENT_DATABASE[existing_index].update(student)
                logger.info(f"Updated existing student record for {student['name']}")
                updated_count += 1
            else:
                # Add new record
                STUDENT_DATABASE.append(student)
                logger.info(f"Added new student record for {student['name']}")
                added_count += 1
        
        # If we didn't find any valid students but we have student_data, try to use it
        if not all_extracted_students and student_data:
            # If we have a name, add it to the database
            if "name" in student_data and student_data["name"]:
                # Add source file information
                student_data["source_file"] = file.filename
                student_data["extraction_time"] = import_time
                
                # Check if this student is already in database (by name)
                existing_index = next((i for i, s in enumerate(STUDENT_DATABASE) 
                                      if s.get("name", "").lower() == student_data["name"].lower()), -1)
                
                if existing_index >= 0:
                    # Update existing record
                    STUDENT_DATABASE[existing_index].update(student_data)
                    logger.info(f"Updated existing student record for {student_data['name']}")
                    updated_count += 1
                else:
                    # Add new record
                    STUDENT_DATABASE.append(student_data)
                    logger.info(f"Added new student record for {student_data['name']}")
                    added_count += 1
        
        # Save the updated database
        if added_count > 0 or updated_count > 0:
            save_student_database()
        
        # Cleanup
        try:
            os.remove(file_location)
            for image_file in image_files:
                if os.path.exists(image_file):
                    os.remove(image_file)
        except Exception as e:
            logger.warning(f"Cleanup error: {str(e)}")
        
        # Return combined results
        return {
            "status": "success",
            "message": f"Processed {len(image_files)} pages successfully. Added {added_count} new students, updated {updated_count} existing records.",
            "student_count": len(all_extracted_students),
            "students": all_extracted_students,
            "page_details": all_data
        }
            
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        error_detail = str(e)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": error_detail}
        )

@app.get("/search-students/")
async def search_students(name: str = Query(..., description="Student name to search for")):
    """Search for students by name"""
    try:
        # Case-insensitive search for partial matches
        search_term = name.lower()
        results = []
        
        for student in STUDENT_DATABASE:
            student_name = student.get("name", "").lower()
            if search_term in student_name:
                results.append(student)
        
        return {
            "status": "success",
            "query": name,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": str(e)}
        )

# Handle application startup and shutdown
@app.on_event("startup")
async def startup_event():
    logger.info("API server starting up...")
    # Load the student database
    load_student_database()
    # Check if Tesseract is available
    try:
        from shutil import which
        if which(pytesseract.pytesseract.tesseract_cmd) is None:
            logger.warning("Tesseract OCR not found at specified path. OCR functionality may not work.")
    except Exception as e:
        logger.warning(f"Could not check Tesseract installation: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("API server shutting down...")
    # Clean up any temporary files that might be left
    if os.path.exists("temp_output"):
        for file in os.listdir("temp_output"):
            try:
                os.remove(os.path.join("temp_output", file))
            except Exception:
                pass

# Define document analysis class for better organization
class PDFExtractKit:
    """PDF-Extract-Kit for advanced document analysis and OSINT extraction"""
    
    def __init__(self):
        self.ocr_engine = pytesseract
        self.has_cv2 = HAS_CV2
        self.has_table_extraction = HAS_TABLE_EXTRACTION
    
    def extract_tables(self, pdf_path, pages='all'):
        """Extract tables from PDF using available libraries"""
        tables = []
        
        if not self.has_table_extraction:
            logger.warning("Table extraction requires tabula-py and camelot-py libraries")
            return tables
            
        try:
            # Try camelot first (better for bordered tables)
            camelot_tables = camelot.read_pdf(pdf_path, pages=pages)
            if len(camelot_tables) > 0:
                logger.info(f"Extracted {len(camelot_tables)} tables using camelot")
                for i, table in enumerate(camelot_tables):
                    tables.append({
                        'extractor': 'camelot',
                        'table_num': i + 1,
                        'page': table.page,
                        'data': table.df.to_dict('records'),
                        'html': table.df.to_html(index=False),
                        'markdown': table.df.to_markdown(index=False),
                    })
        except Exception as e:
            logger.error(f"Camelot table extraction error: {str(e)}")
            
        try:
            # Try tabula as fallback (better for some tables)
            tabula_tables = tabula.read_pdf(pdf_path, pages=pages, multiple_tables=True)
            if len(tabula_tables) > 0:
                logger.info(f"Extracted {len(tabula_tables)} tables using tabula")
                for i, df in enumerate(tabula_tables):
                    if not df.empty:
                        tables.append({
                            'extractor': 'tabula',
                            'table_num': len(tables) + 1,
                            'page': 'unknown',  # tabula doesn't provide page info
                            'data': df.to_dict('records'),
                            'html': df.to_html(index=False),
                            'markdown': df.to_markdown(index=False),
                        })
        except Exception as e:
            logger.error(f"Tabula table extraction error: {str(e)}")
            
        return tables
    
    def detect_layout(self, pdf_document):
        """Detect the layout structure of a PDF document"""
        layout_info = []
        
        try:
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                
                # Extract text blocks with their bounding boxes
                blocks = page.get_text("dict")["blocks"]
                
                page_layout = {
                    'page': page_num + 1,
                    'width': page.rect.width,
                    'height': page.rect.height,
                    'elements': []
                }
                
                for block in blocks:
                    if block['type'] == 0:  # Text block
                        for line in block['lines']:
                            for span in line['spans']:
                                element = {
                                    'type': 'text',
                                    'text': span['text'],
                                    'font': span['font'],
                                    'size': span['size'],
                                    'bbox': [span['bbox'][0], span['bbox'][1], span['bbox'][2], span['bbox'][3]],
                                    'color': span.get('color', None),
                                    'bold': span.get('bold', False),
                                    'italic': span.get('italic', False)
                                }
                                page_layout['elements'].append(element)
                    elif block['type'] == 1:  # Image block
                        element = {
                            'type': 'image',
                            'bbox': [block['bbox'][0], block['bbox'][1], block['bbox'][2], block['bbox'][3]],
                        }
                        page_layout['elements'].append(element)
                
                layout_info.append(page_layout)
                
            return layout_info
        except Exception as e:
            logger.error(f"Layout detection error: {str(e)}")
            return []
    
    def extract_formulas(self, pdf_path, pdf_document):
        """Attempt to extract formulas from PDF (basic implementation)"""
        formulas = []
        
        try:
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                
                # Get page text
                text = page.get_text()
                
                # Simple regex patterns to identify potential formulas
                formula_patterns = [
                    r'=\s*[\w\+\-\*/\^\(\)\[\]\{\}\.]+',  # Basic equation pattern
                    r'[\w\+\-\*/\^\(\)\[\]\{\}\.]+\s*=\s*[\w\+\-\*/\^\(\)\[\]\{\}\.]+',  # More complex equation
                    r'∑[^\n]+',  # Summation
                    r'∫[^\n]+',  # Integral
                    r'[a-zA-Z][\w]*\([a-zA-Z][\w]*\)\s*=',  # Function definition
                ]
                
                for pattern in formula_patterns:
                    matches = re.finditer(pattern, text, re.MULTILINE)
                    for match in matches:
                        formula = {
                            'page': page_num + 1,
                            'text': match.group(0),
                            'position': match.span(),
                        }
                        formulas.append(formula)
            
            return formulas
        except Exception as e:
            logger.error(f"Formula extraction error: {str(e)}")
            return []
    
    def extract_document_metadata(self, pdf_document):
        """Extract metadata from the PDF document"""
        try:
            metadata = pdf_document.metadata
            if metadata:
                return {k.lower().replace('/', '_'): v for k, v in metadata.items() if v}
            return {}
        except Exception as e:
            logger.error(f"Metadata extraction error: {str(e)}")
            return {}
    
    def analyze_document(self, pdf_path):
        """Comprehensive document analysis for OSINT purposes"""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
        results = {
            'metadata': {},
            'pages': [],
            'tables': [],
            'formulas': [],
            'layout': [],
            'text_content': '',
        }
        
        try:
            # Open PDF with PyMuPDF
            pdf_document = fitz.open(pdf_path)
            
            # Extract metadata
            results['metadata'] = self.extract_document_metadata(pdf_document)
            
            # Process each page
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                text = page.get_text()
                
                page_info = {
                    'page': page_num + 1,
                    'text': text,
                    'size': [page.rect.width, page.rect.height],
                }
                
                results['pages'].append(page_info)
                results['text_content'] += f"\n\n--- Page {page_num + 1} ---\n\n{text}"
            
            # Extract tables
            results['tables'] = self.extract_tables(pdf_path)
            
            # Extract layout information
            results['layout'] = self.detect_layout(pdf_document)
            
            # Extract formulas
            results['formulas'] = self.extract_formulas(pdf_path, pdf_document)
            
            # Close the document
            pdf_document.close()
            
            return results
            
        except Exception as e:
            logger.error(f"Document analysis error: {str(e)}")
            if 'pdf_document' in locals():
                pdf_document.close()
            raise

# Create the OSINT extraction kit instance
pdf_extract_kit = PDFExtractKit()

@app.post("/osint_analysis", response_class=JSONResponse)
async def analyze_pdf_for_osint(file: UploadFile = File(...)):
    """
    Analyze a PDF document thoroughly for OSINT purposes.
    Extracts metadata, text, tables, formulas, and document structure.
    """
    try:
        # Create a temporary file to store the uploaded PDF
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_pdf_path = temp_pdf.name
        
        try:
            # Write the uploaded file to the temporary file
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf.close()
            
            # Perform comprehensive document analysis
            analysis_results = pdf_extract_kit.analyze_document(temp_pdf_path)
            
            return {
                "filename": file.filename,
                "analysis": analysis_results
            }
            
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
                
    except Exception as e:
        logger.error(f"Error during OSINT PDF analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF for OSINT: {str(e)}"
        )

if __name__ == "__main__":
    # For the import_time variable
    from datetime import datetime
    import_time = datetime.now().isoformat()
    
    import uvicorn
    logger.info("Starting API server at http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001) 