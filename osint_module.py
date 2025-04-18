import requests
from bs4 import BeautifulSoup
import json
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from linkedin_api import Linkedin
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SocialMediaProfile:
    platform: str
    username: str
    url: str
    data: Dict

@dataclass
class OSINTResult:
    email: str
    linkedin_data: Optional[Dict] = None
    social_profiles: List[SocialMediaProfile] = None
    professional_info: Dict = None
    timestamp: str = None

class OSINTScraper:
    def __init__(self):
        self.linkedin_api = None
        self.setup_linkedin_api()
        
    def setup_linkedin_api(self):
        """Initialize LinkedIn API with credentials"""
        try:
            linkedin_email = os.getenv('LINKEDIN_EMAIL')
            linkedin_password = os.getenv('LINKEDIN_PASSWORD')
            if linkedin_email and linkedin_password:
                self.linkedin_api = Linkedin(linkedin_email, linkedin_password)
                logger.info("LinkedIn API initialized successfully")
            else:
                logger.warning("LinkedIn credentials not found in environment variables")
        except Exception as e:
            logger.error(f"Failed to initialize LinkedIn API: {str(e)}")

    def extract_email_domain(self, email: str) -> str:
        """Extract domain from email address"""
        return email.split('@')[1] if '@' in email else None

    def search_linkedin(self, email: str) -> Optional[Dict]:
        """Search LinkedIn for professional information"""
        try:
            if not self.linkedin_api:
                return None

            # Search by email domain first
            domain = self.extract_email_domain(email)
            if not domain:
                return None

            # Search for company information
            company_info = self.linkedin_api.search_companies(domain)
            
            # Search for people with similar email domain
            people_results = self.linkedin_api.search_people(
                keyword_first_name="",
                keyword_last_name="",
                keyword_company=domain
            )

            return {
                "company_info": company_info,
                "people_results": people_results,
                "search_timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"LinkedIn search failed: {str(e)}")
            return None

    def search_social_media(self, email: str) -> List[SocialMediaProfile]:
        """Search various social media platforms for the email"""
        profiles = []
        
        # Add delay to avoid rate limiting
        time.sleep(2)
        
        try:
            # Search GitHub
            github_data = self.search_github(email)
            if github_data:
                profiles.append(SocialMediaProfile(
                    platform="GitHub",
                    username=github_data.get("username"),
                    url=github_data.get("url"),
                    data=github_data
                ))

            # Search Twitter
            twitter_data = self.search_twitter(email)
            if twitter_data:
                profiles.append(SocialMediaProfile(
                    platform="Twitter",
                    username=twitter_data.get("username"),
                    url=twitter_data.get("url"),
                    data=twitter_data
                ))

            # Add more social media platforms here
            
        except Exception as e:
            logger.error(f"Social media search failed: {str(e)}")

        return profiles

    def search_github(self, email: str) -> Optional[Dict]:
        """Search GitHub for user information"""
        try:
            headers = {
                'Authorization': f'token {os.getenv("GITHUB_TOKEN")}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            # Search for user by email
            response = requests.get(
                f'https://api.github.com/search/users?q={email}',
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['items']:
                    user = data['items'][0]
                    return {
                        "username": user['login'],
                        "url": user['html_url'],
                        "profile_data": user
                    }
            return None
        except Exception as e:
            logger.error(f"GitHub search failed: {str(e)}")
            return None

    def search_twitter(self, email: str) -> Optional[Dict]:
        """Search Twitter for user information"""
        try:
            # Note: Twitter API requires authentication
            # This is a placeholder for Twitter search implementation
            return None
        except Exception as e:
            logger.error(f"Twitter search failed: {str(e)}")
            return None

    def gather_professional_info(self, email: str) -> Dict:
        """Gather professional information from various sources"""
        professional_info = {
            "email": email,
            "domain": self.extract_email_domain(email),
            "sources": [],
            "last_updated": datetime.now().isoformat()
        }

        # Add LinkedIn data
        linkedin_data = self.search_linkedin(email)
        if linkedin_data:
            professional_info["linkedin"] = linkedin_data
            professional_info["sources"].append("linkedin")

        # Add social media profiles
        social_profiles = self.search_social_media(email)
        if social_profiles:
            professional_info["social_profiles"] = [
                {
                    "platform": profile.platform,
                    "username": profile.username,
                    "url": profile.url
                }
                for profile in social_profiles
            ]
            professional_info["sources"].extend(
                [profile.platform.lower() for profile in social_profiles]
            )

        return professional_info

    def perform_osint_search(self, email: str) -> OSINTResult:
        """Perform comprehensive OSINT search for an email address"""
        try:
            # Gather professional information
            professional_info = self.gather_professional_info(email)
            
            # Create OSINT result
            result = OSINTResult(
                email=email,
                professional_info=professional_info,
                timestamp=datetime.now().isoformat()
            )
            
            return result
        except Exception as e:
            logger.error(f"OSINT search failed: {str(e)}")
            return None

# Example usage
if __name__ == "__main__":
    scraper = OSINTScraper()
    result = scraper.perform_osint_search("example@company.com")
    print(json.dumps(result.__dict__, indent=2)) 