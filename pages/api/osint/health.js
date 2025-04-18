// Replace axios with native fetch
// import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call the FastAPI backend health endpoint using fetch
    const response = await fetch('http://localhost:8000/osint/health');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error: ${response.status}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('OSINT health check error:', error);
    return res.status(500).json({ 
      error: 'Failed to check OSINT module health',
      details: error.message 
    });
  }
} 