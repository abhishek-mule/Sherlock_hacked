import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// For security, this endpoint should be protected in production
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate request data
    if (!data.reversecontact_api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key is required' 
      }, { status: 400 });
    }
    
    // Basic validation of API key format
    if (!data.reversecontact_api_key.startsWith('sk_') || data.reversecontact_api_key.length < 20) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid API key format. ReverseContact API keys typically start with "sk_" and are at least 20 characters long.' 
      }, { status: 400 });
    }
    
    // Get the current environment variables to update
    let envContent = '';
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the API key
    const envLines = envContent.split('\n');
    let keyExists = false;
    
    const updatedLines = envLines.map(line => {
      if (line.startsWith('REVERSECONTACT_API_KEY=')) {
        keyExists = true;
        return `REVERSECONTACT_API_KEY=${data.reversecontact_api_key}`;
      }
      return line;
    });
    
    // If the key doesn't exist in the file, add it
    if (!keyExists) {
      updatedLines.push(`REVERSECONTACT_API_KEY=${data.reversecontact_api_key}`);
    }
    
    // Write the updated environment variables back to the file
    fs.writeFileSync(envPath, updatedLines.join('\n'));
    
    // For demonstration purposes, also update API key in memory
    // NOTE: This won't persist after server restart, but allows testing without restart
    process.env.REVERSECONTACT_API_KEY = data.reversecontact_api_key;
    
    return NextResponse.json({ 
      success: true,
      message: 'API key updated successfully. You may need to restart the application for changes to take effect.'
    });
  } catch (error) {
    console.error('Error updating API keys:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update API keys: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
} 