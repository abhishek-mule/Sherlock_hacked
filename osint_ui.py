import streamlit as st
import pandas as pd
from osint_module import OSINTScraper
import json
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

class OSINTUI:
    def __init__(self):
        self.scraper = OSINTScraper()
        self.setup_page()

    def setup_page(self):
        """Configure the Streamlit page settings"""
        st.set_page_config(
            page_title="OSINT Intelligence Dashboard",
            page_icon="🔍",
            layout="wide",
            initial_sidebar_state="expanded"
        )

    def render_header(self):
        """Render the header section"""
        st.title("🔍 OSINT Intelligence Dashboard")
        st.markdown("""
        <style>
        .main {
            padding: 2rem;
        }
        .stButton>button {
            width: 100%;
            height: 3rem;
            border-radius: 0.5rem;
        }
        .css-1d391kg {
            padding: 1rem;
        }
        @media (max-width: 768px) {
            .main {
                padding: 1rem;
            }
        }
        </style>
        """, unsafe_allow_html=True)

    def render_search_section(self):
        """Render the search input section"""
        with st.container():
            col1, col2 = st.columns([3, 1])
            with col1:
                email = st.text_input(
                    "Enter Email Address",
                    placeholder="example@company.com",
                    help="Enter the email address to perform OSINT search"
                )
            with col2:
                st.write("")
                st.write("")
                search_button = st.button("🔍 Search", key="search_button")

        return email, search_button

    def render_results(self, result):
        """Render the search results"""
        if not result:
            st.error("No results found or search failed.")
            return

        # Create tabs for different sections
        tab1, tab2, tab3 = st.tabs(["📊 Overview", "👥 Professional Info", "🔗 Social Profiles"])

        with tab1:
            self.render_overview_tab(result)

        with tab2:
            self.render_professional_info_tab(result)

        with tab3:
            self.render_social_profiles_tab(result)

    def render_overview_tab(self, result):
        """Render the overview tab"""
        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Search Summary")
            st.write(f"Email: {result.email}")
            st.write(f"Domain: {result.professional_info['domain']}")
            st.write(f"Last Updated: {datetime.fromisoformat(result.timestamp).strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Sources found
            sources = result.professional_info.get('sources', [])
            if sources:
                st.write("Sources Found:")
                for source in sources:
                    st.write(f"- {source.title()}")

        with col2:
            # Create a pie chart of data sources
            if sources:
                fig = go.Figure(data=[go.Pie(
                    labels=[s.title() for s in sources],
                    values=[1] * len(sources),
                    hole=.3
                )])
                fig.update_layout(title="Data Sources Distribution")
                st.plotly_chart(fig, use_container_width=True)

    def render_professional_info_tab(self, result):
        """Render the professional information tab"""
        linkedin_data = result.professional_info.get('linkedin', {})
        
        if linkedin_data:
            st.subheader("LinkedIn Information")
            
            # Company Information
            if 'company_info' in linkedin_data:
                st.write("### Company Details")
                company_info = linkedin_data['company_info']
                if company_info:
                    for company in company_info:
                        with st.expander(f"🏢 {company.get('name', 'Unknown Company')}"):
                            st.write(f"Industry: {company.get('industry', 'N/A')}")
                            st.write(f"Size: {company.get('size', 'N/A')}")
                            st.write(f"Location: {company.get('location', 'N/A')}")

            # People Results
            if 'people_results' in linkedin_data:
                st.write("### Related Profiles")
                people_results = linkedin_data['people_results']
                if people_results:
                    for person in people_results:
                        with st.expander(f"👤 {person.get('name', 'Unknown Person')}"):
                            st.write(f"Title: {person.get('title', 'N/A')}")
                            st.write(f"Company: {person.get('company', 'N/A')}")
                            st.write(f"Location: {person.get('location', 'N/A')}")

    def render_social_profiles_tab(self, result):
        """Render the social profiles tab"""
        social_profiles = result.professional_info.get('social_profiles', [])
        
        if social_profiles:
            st.subheader("Social Media Profiles")
            
            # Create a grid of social media cards
            cols = st.columns(3)
            for idx, profile in enumerate(social_profiles):
                with cols[idx % 3]:
                    with st.container():
                        st.markdown(f"""
                        <div style='padding: 1rem; border-radius: 0.5rem; background-color: #f0f2f6; margin-bottom: 1rem;'>
                            <h3 style='margin: 0;'>{profile['platform']}</h3>
                            <p style='margin: 0.5rem 0;'>@{profile['username']}</p>
                            <a href='{profile['url']}' target='_blank' style='color: #0066cc;'>View Profile</a>
                        </div>
                        """, unsafe_allow_html=True)

    def run(self):
        """Run the OSINT UI application"""
        self.render_header()
        
        email, search_button = self.render_search_section()
        
        if search_button and email:
            with st.spinner("🔍 Performing OSINT search..."):
                result = self.scraper.perform_osint_search(email)
                self.render_results(result)

if __name__ == "__main__":
    ui = OSINTUI()
    ui.run() 