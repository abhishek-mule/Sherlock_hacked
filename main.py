from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid4
from pdf2image import convert_from_bytes
from PIL import Image
import pytesseract
import io
import logging
import subprocess
import os 
import json
from datetime import datetime
from paddleocr import PaddleOCR
import torch
from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import numpy as np
from osint_module import OSINTScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Document Processing API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

# Label mappings
id2label = {0: 'B-KEY', 1: 'B-VALUE', 2: 'O'}
label2id = {v: k for k, v in id2label.items()}

class ModelManager:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = None
        self.initialize_model()

    def initialize_model(self):
        try:
            logger.info("Loading pre-trained LayoutLMv3 model from HuggingFace")
            
            # Use pre-trained model directly from HuggingFace with apply_ocr=False
            self.processor = LayoutLMv3Processor.from_pretrained(
                "microsoft/layoutlmv3-base", 
                apply_ocr=False  # Important: Set this to False since we're using PaddleOCR
            )
            self.model = LayoutLMv3ForTokenClassification.from_pretrained(
                "microsoft/layoutlmv3-base",
                num_labels=len(id2label)
            )
            
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {self.device}")
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("Model initialization completed successfully")
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
            raise

# Initialize model manager
model_manager = ModelManager()

def process_paddle_ocr_output(result, width, height):
    """
    Process PaddleOCR output to format required by LayoutLMv3.
    Ensures all coordinates are normalized to 0-1000 range.
    
    Args:
        result: PaddleOCR output
        width: Original image width
        height: Original image height
        
    Returns:
        Tuple of (words, boxes, confidences) where coordinates are normalized to 0-1000 range
    """
    words = []
    boxes = []
    confidences = []
    
    if not result or not result[0]:
        return [], [], []
    
    for line in result[0]:
        if len(line) != 2:  # Verify OCR result format
            continue
            
        bbox, (text, conf) = line
        
        if not isinstance(bbox, list) or len(bbox) != 4:
            continue
            
        # Convert coordinates from points to pixels
        x1, y1 = bbox[0]
        x2, y2 = bbox[2]
        
        # Normalize to 0-1000 range
        x1_norm = int((x1 / width) * 1000)
        y1_norm = int((y1 / height) * 1000)
        x2_norm = int((x2 / width) * 1000)
        y2_norm = int((y2 / height) * 1000)
        
        # Ensure values stay within 0-1000 range
        x1_norm = max(0, min(x1_norm, 1000))
        y1_norm = max(0, min(y1_norm, 1000))
        x2_norm = max(0, min(x2_norm, 1000))
        y2_norm = max(0, min(y2_norm, 1000))
        
        normalized_box = [x1_norm, y1_norm, x2_norm, y2_norm]
        
        words.append(text)
        boxes.append(normalized_box)
        confidences.append(conf)
    
    return words, boxes, confidences

@app.post("/extract/")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Process PDF file: Convert to images, perform OCR, and predict labels using LayoutLMv3 
    """
    try:
        # Save uploaded file temporarily
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        logger.info(f"File saved temporarily at: {file_location}")

        # Configure paths
        input_pdf = os.path.abspath(file_location)
        output_image = os.path.abspath("temp_output/temp_output")
        os.makedirs(os.path.dirname(output_image), exist_ok=True)

        # Convert PDF to images
        command = f'"C:/poppler/poppler-24.08.0/Library/bin/pdftoppm" -jpeg "{input_pdf}" "{output_image}"'
        try:
            subprocess.run(command, shell=True, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"PDF conversion failed: {e.stderr.decode()}")

        # Process each page
        all_results = []
        page_num = 1
        
        while True:
            image_path = f"{output_image}-{page_num}.jpg"
            if not os.path.exists(image_path):
                break

            logger.info(f"Processing page {page_num}")
            
            # Load image
            image = Image.open(image_path).convert("RGB")
            width, height = image.size
            
            # Perform OCR
            ocr_result = ocr.ocr(image_path, cls=True)
            words, boxes, confidences = process_paddle_ocr_output(ocr_result, width, height)
            
            if not words:
                logger.warning(f"No text detected on page {page_num}")
                page_num += 1
                continue
            
            # Prepare inputs for LayoutLMv3
            try:
                encoding = model_manager.processor(
                    image,
                    text=words,
                    boxes=boxes,
                    truncation=True,
                    padding="max_length",
                    return_tensors="pt"
                )
                
                # Move to device
                encoding = {k: v.to(model_manager.device) for k, v in encoding.items()}
                
                # Get predictions
                with torch.no_grad():
                    outputs = model_manager.model(**encoding)
                    predictions = outputs.logits.argmax(-1)
                
                # Process results
                page_results = []
                for word, box, conf, pred in zip(words, boxes, confidences, predictions[0]):
                    if pred < len(id2label):
                        result = {
                            'text': word,
                            'bbox': box,
                            'confidence': float(conf),
                            'label': id2label[pred.item()]
                        }
                        page_results.append(result)
                
                all_results.append({
                    'page': page_num,
                    'results': page_results
                })
                
            except Exception as e:
                logger.error(f"Error processing page {page_num}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing page {page_num}: {str(e)}")
            
            page_num += 1

        # Cleanup
        try:
            os.remove(file_location)
            for i in range(1, page_num):
                image_path = f"{output_image}-{i}.jpg"
                if os.path.exists(image_path):
                    os.remove(image_path)
        except Exception as e:
            logger.warning(f"Cleanup error: {str(e)}")

        return {
            "status": "success",
            "message": f"Processed {page_num-1} pages successfully",
            "results": all_results
        }

    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Student data storage
STUDENT_DB_FILE = "student_database.json"

def load_student_database():
    if os.path.exists(STUDENT_DB_FILE):
        with open(STUDENT_DB_FILE, 'r') as f:
            return json.load(f)
    return []

def save_student_database(data):
    with open(STUDENT_DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.post("/extract-student-data/")
async def extract_student_data(file: UploadFile = File(...)):
    """
    Extract student data from PDF and store in database
    """
    try:
        # Save uploaded file temporarily
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        logger.info(f"File saved temporarily at: {file_location}")

        # Configure paths
        input_pdf = os.path.abspath(file_location)
        output_image = os.path.abspath("temp_output/temp_output")
        os.makedirs(os.path.dirname(output_image), exist_ok=True)

        # Convert PDF to images
        command = f'"C:/poppler/bin/pdftoppm" -jpeg "{input_pdf}" "{output_image}"'
        try:
            subprocess.run(command, shell=True, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"PDF conversion failed: {e.stderr.decode()}")

        # Process each page
        all_results = []
        page_num = 1
        
        while True:
            image_path = f"{output_image}-{page_num}.jpg"
            if not os.path.exists(image_path):
                break

            logger.info(f"Processing page {page_num}")
            
            # Load image
            image = Image.open(image_path).convert("RGB")
            width, height = image.size
            
            # Perform OCR
            ocr_result = ocr.ocr(image_path, cls=True)
            words, boxes, confidences = process_paddle_ocr_output(ocr_result, width, height)
            
            if not words:
                logger.warning(f"No text detected on page {page_num}")
                page_num += 1
                continue
            
            # Extract student data
            student_data = {
                "name": "",
                "student_id": "",
                "course": "",
                "email": "",
                "phone": "",
                "address": "",
                "extraction_time": datetime.now().isoformat(),
                "source_file": file.filename
            }
            
            # Process OCR results to extract student data
            for word, box, conf in zip(words, boxes, confidences):
                # Add your logic here to identify and extract student information
                # This is a simple example - you'll need to customize based on your PDF format
                if "Name:" in word:
                    student_data["name"] = word.split("Name:")[1].strip()
                elif "ID:" in word:
                    student_data["student_id"] = word.split("ID:")[1].strip()
                elif "Course:" in word:
                    student_data["course"] = word.split("Course:")[1].strip()
                elif "@" in word:
                    student_data["email"] = word.strip()
                elif any(c.isdigit() for c in word) and len(word) > 8:
                    student_data["phone"] = word.strip()
            
            # Save to database
            db = load_student_database()
            db.append(student_data)
            save_student_database(db)
            
            all_results.append({
                'page': page_num,
                'student_data': student_data
            })
            
            page_num += 1

        # Cleanup
        try:
            os.remove(file_location)
            for i in range(1, page_num):
                image_path = f"{output_image}-{i}.jpg"
                if os.path.exists(image_path):
                    os.remove(image_path)
        except Exception as e:
            logger.warning(f"Cleanup error: {str(e)}")

        return {
            "status": "success",
            "message": f"Processed {page_num-1} pages successfully",
            "student_data": all_results
        }

    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search-students/")
async def search_students(name: Optional[str] = None):
    """
    Search for students by name
    """
    try:
        db = load_student_database()
        if not name:
            return {
                "status": "success",
                "count": len(db),
                "results": db
            }
        
        results = [
            student for student in db 
            if name.lower() in student.get("name", "").lower()
        ]
        
        return {
            "status": "success",
            "query": name,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize OSINT scraper
osint_scraper = OSINTScraper()

class OSINTRequest(BaseModel):
    email: str

@app.post("/osint/search")
async def osint_search(request: OSINTRequest):
    """
    Perform OSINT search for an email address
    """
    try:
        # Check if we should use mock data
        use_mock_data = os.getenv('USE_MOCK_DATA', 'false').lower() == 'true'
        
        if use_mock_data:
            # Create mock data for testing purposes
            domain = request.email.split('@')[1]
            username = request.email.split('@')[0]
            company_name = domain.split('.')[0].capitalize()
            
            # Create mock result
            mock_result = {
                "email": request.email,
                "professional_info": {
                    "sources": ["linkedin", "github", "twitter"],
                    "domain": domain,
                    "company": company_name,
                    "social_profiles": [
                        {
                            "platform": "GitHub",
                            "username": username,
                            "url": f"https://github.com/{username}",
                            "verified": True,
                            "followers": 120
                        },
                        {
                            "platform": "LinkedIn",
                            "username": username,
                            "url": f"https://linkedin.com/in/{username}",
                            "verified": True
                        },
                        {
                            "platform": "Twitter",
                            "username": username,
                            "url": f"https://twitter.com/{username}",
                            "verified": False,
                            "followers": 350
                        }
                    ],
                    "linkedin": {
                        "company_info": [
                            {
                                "name": company_name,
                                "industry": "Technology",
                                "size": "51-200",
                                "location": "New York"
                            }
                        ],
                        "people_results": [
                            {
                                "name": "John Smith",
                                "title": "Software Engineer",
                                "company": company_name,
                                "location": "New York"
                            },
                            {
                                "name": "Jane Doe",
                                "title": "Product Manager",
                                "company": company_name,
                                "location": "San Francisco"
                            }
                        ]
                    }
                },
                "is_mock_data": True
            }
            return mock_result
        
        # Use the real OSINT scraper
        result = osint_scraper.perform_osint_search(request.email)
        if not result:
            raise HTTPException(status_code=404, detail="No results found")
        return result.__dict__
    except Exception as e:
        logger.error(f"OSINT search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/osint/health")
async def osint_health():
    """
    Check OSINT module health
    """
    return {"status": "ok", "module": "osint"}

@app.get("/search-admission-data/")
async def search_admission_data(query: str = Query(..., min_length=3)):
    """
    Search through the data.txt file for student admission information
    """
    try:
        data_file_path = "app/data.txt"
        if not os.path.exists(data_file_path):
            raise HTTPException(status_code=404, detail="Data file not found")
        
        # Read the data file
        with open(data_file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        results = []
        
        # Define a simple context window to capture information around matching lines
        context_window = 15
        total_lines = len(lines)
        
        for i, line in enumerate(lines):
            if query.lower() in line.lower():
                # Determine start and end of context window
                start = max(0, i - context_window)
                end = min(total_lines, i + context_window + 1)
                
                # Extract context
                context = "".join(lines[start:end])
                
                # Create a result entry
                result = {
                    "line_number": i + 1,
                    "context": context,
                    "match_line": line.strip()
                }
                
                results.append(result)
        
        return {
            "status": "success",
            "query": query,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 