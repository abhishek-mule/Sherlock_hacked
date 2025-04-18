from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="OSINT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OSINTRequest(BaseModel):
    email: str

@app.post("/osint/search")
async def osint_search(request: OSINTRequest):
    """
    Perform OSINT search for an email address
    """
    try:
        logger.info(f"Processing OSINT search for: {request.email}")
        
        # Extract email components
        domain = request.email.split('@')[1]
        username = request.email.split('@')[0]
        company_name = domain.split('.')[0].capitalize()
        
        # Create mock result with proper structure for frontend
        mock_result = {
            "email": request.email,
            "basic_info": {
                "email": request.email,
                "username": username,
                "name": username.replace(".", " ").title()
            },
            "professional_info": {
                "sources": ["linkedin", "github", "twitter"],
                "domain": domain,
                "job_title": "Software Engineer",
                "location": "New York, USA",
                "connection_count": 287,
                "last_updated": datetime.now().isoformat(),
                "social_profiles": [
                    {
                        "platform": "GitHub",
                        "username": username,
                        "url": f"https://github.com/{username}",
                        "bio": f"Profile found via {request.email}",
                        "verified": True,
                        "followers": 120
                    },
                    {
                        "platform": "LinkedIn",
                        "username": username,
                        "url": f"https://linkedin.com/in/{username}",
                        "bio": f"Profile found via {request.email}",
                        "verified": True
                    },
                    {
                        "platform": "Twitter",
                        "username": username,
                        "url": f"https://twitter.com/{username}",
                        "bio": f"Profile found via {request.email}",
                        "verified": False,
                        "followers": 350
                    }
                ],
                "company": {
                    "name": company_name,
                    "website": f"https://{domain}",
                    "industry": "Technology",
                    "size": "51-200",
                    "location": "New York",
                    "description": f"{company_name} is a leading provider of innovative solutions.",
                    "logo": None
                },
                "linkedin": {
                    "company_info": [
                        {
                            "name": company_name,
                            "industry": "Technology",
                            "size": "51-200",
                            "location": "New York",
                            "description": f"{company_name} is a technology company.",
                            "logo": None
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
            "contact_info": {
                "email_addresses": [request.email],
                "social_handles": [
                    {
                        "platform": "GitHub",
                        "handle": username
                    },
                    {
                        "platform": "LinkedIn",
                        "handle": username
                    },
                    {
                        "platform": "Twitter",
                        "handle": username
                    }
                ]
            },
            "security_info": {
                "breached_accounts": [
                    {
                        "site": "LinkedIn",
                        "breach_date": "2021-06-15",
                        "compromised_data": ["Email addresses", "Passwords"]
                    }
                ]
            },
            "is_mock_data": True
        }
        
        logger.info(f"Successfully completed OSINT search for {request.email}")
        return mock_result
    
    except Exception as e:
        logger.error(f"OSINT search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/osint/enrichment")
async def osint_enrichment(email: str):
    """
    Perform email enrichment to get detailed information about a person
    """
    try:
        logger.info(f"Processing enrichment for email: {email}")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email parameter is required")
        
        # Email regex validation
        # (simplified for this example)
        if '@' not in email or '.' not in email.split('@')[1]:
            raise HTTPException(status_code=400, detail="Invalid email format")
            
        # Extract name and domain from email
        username = email.split('@')[0]
        domain = email.split('@')[1]
        
        # Format the name for display
        name_parts = username.replace(".", " ").replace("-", " ").replace("_", " ").split()
        name = " ".join([part.capitalize() for part in name_parts])
        
        # Generate mock enrichment data
        mock_data = {
            "status": 200,
            "likelihood": 0.85,
            "data": {
                "full_name": name,
                "first_name": name.split(' ')[0] if ' ' in name else name,
                "last_name": name.split(' ')[1] if ' ' in name else '',
                "email": email,
                "gender": "male" if hash(email) % 2 == 0 else "female",
                "birth_date": None,
                "birth_year": None,
                "linkedin_url": f"https://linkedin.com/in/{username}",
                "facebook_url": f"https://facebook.com/{username}",
                "twitter_url": f"https://twitter.com/{username}",
                "github_url": f"https://github.com/{username}",
                "work": [
                    {
                        "company": {
                            "name": domain.split('.')[0].capitalize(),
                            "size": "51-200",
                            "industry": "Technology"
                        },
                        "title": "Software Engineer",
                        "start_date": "2021-01",
                        "end_date": None,
                        "is_current": True
                    }
                ],
                "education": [
                    {
                        "school": {
                            "name": "Example University",
                            "type": "college"
                        },
                        "degree": "Bachelor's Degree",
                        "start_date": "2017-09",
                        "end_date": "2021-05",
                        "is_current": False
                    }
                ],
                "location": {
                    "name": "Mumbai, Maharashtra, India",
                    "country": "in",
                    "region": "Maharashtra",
                    "city": "Mumbai",
                    "postal_code": None
                },
                "skills": ["JavaScript", "React", "Node.js", "TypeScript", "Next.js"],
                "is_mock_data": True
            }
        }
        
        logger.info(f"Successfully completed enrichment for {email}")
        return mock_data
        
    except Exception as e:
        logger.error(f"Email enrichment failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/osint/health")
async def osint_health():
    """
    Simple health check endpoint
    """
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 