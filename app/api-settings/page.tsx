'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';
import { BottomNav } from '@/components/ui/bottom-nav';
import { ClientOnly } from '@/components/client-only';
import ApiStatusChecker from '@/components/ApiStatusChecker';

export default function ApiSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const saveApiSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Update API key via API endpoint
      const response = await fetch('/api/admin/update-api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reversecontact_api_key: apiKey
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveMessage({
          type: 'success',
          text: 'API settings updated successfully. You may need to restart the application for changes to take effect.'
        });
      } else {
        setSaveMessage({
          type: 'error',
          text: data.error || 'Failed to update API settings. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error saving API settings:', error);
      setSaveMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const openFixPage = () => {
    window.open("https://reversecontact.com/dashboard", "_blank");
  };
  
  
  const openAddCreditsPage = () => {
    window.open("https://reversecontact.com/pricing", "_blank");
  };
  
  return (
    <ClientOnly>
      <AnimatedPage>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
          <header className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-10 px-4 md:py-16">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">API Settings</h1>
              <p className="text-teal-100 max-w-2xl">
                Configure your API keys and test your integrations
              </p>
            </div>
          </header>
          
          <main className="container mx-auto max-w-4xl px-4 -mt-8 mb-24">
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle>ReverseContact API Configuration</CardTitle>
                <CardDescription>
                  Enter your ReverseContact API key to enable email enrichment functionality
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
                  <Info className="text-blue-500 dark:text-blue-400 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      The application requires a valid ReverseContact API key with sufficient credits for email enrichment to work properly.
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      You can get a new API key from <a href="https://reversecontact.com" target="_blank" rel="noopener noreferrer" className="underline">ReverseContact.com</a>
                    </p>
                  </div>
                </div>
                
                <ApiStatusChecker 
                  onFix={openFixPage} 
                  onAddCredits={openAddCreditsPage}
                />
                
                <div className="space-y-3">
                  <Label htmlFor="api-key">ReverseContact API Key</Label>
                  <Input 
                    id="api-key" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    placeholder="sk_..." 
                    type="password"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your API key will be stored securely in environment variables
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input 
                    id="test-email" 
                    value={testEmail} 
                    onChange={(e) => setTestEmail(e.target.value)} 
                    placeholder="email@example.com" 
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Email to use for testing the API connection
                  </p>
                </div>
                
                {saveMessage && (
                  <div className={`rounded-lg p-4 flex items-start ${
                    saveMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                    saveMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {saveMessage.type === 'success' ? (
                      <CheckCircle className="text-green-500 dark:text-green-400 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : saveMessage.type === 'error' ? (
                      <AlertCircle className="text-red-500 dark:text-red-400 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Info className="text-blue-500 dark:text-blue-400 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${
                      saveMessage.type === 'success' ? 'text-green-800 dark:text-green-200' :
                      saveMessage.type === 'error' ? 'text-red-800 dark:text-red-200' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>
                      {saveMessage.text}
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={saveApiSettings} 
                  disabled={isSaving || !apiKey || apiKey.length < 10}
                >
                  {isSaving ? 'Saving...' : 'Save API Settings'}
                </Button>
              </CardFooter>
            </Card>
          </main>
          
          <BottomNav />
        </div>
      </AnimatedPage>
    </ClientOnly>
  );
} 