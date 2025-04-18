import React, { useState } from 'react';

interface ApiStatusCheckerProps {
  onFix?: () => void;
}

export default function ApiStatusChecker({ onFix }: ApiStatusCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | 'unknown'>('unknown');
  const [message, setMessage] = useState<string>('');

  const checkApiStatus = async () => {
    setChecking(true);
    setStatus('unknown');
    setMessage('Checking API status...');

    try {
      // Make a test call to the API with a known email
      const response = await fetch(`/api/enrichment/status`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'API is working correctly!');
      } else {
        setStatus('error');
        setMessage(data.error || 'API is not configured correctly.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to check API status. Internal server error.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
      <h3 className="font-semibold text-lg mb-2">API Status Check</h3>
      
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          status === 'success' ? 'bg-green-500' :
          status === 'error' ? 'bg-red-500' :
          'bg-gray-300'
        }`}></div>
        <span className="text-sm">{
          status === 'success' ? 'API is working' :
          status === 'error' ? 'API configuration issue' :
          'Status unknown'
        }</span>
      </div>
      
      {message && (
        <div className={`text-sm rounded px-3 py-2 mb-3 ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={checkApiStatus}
          disabled={checking}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Check Status'}
        </button>
        
        {status === 'error' && onFix && (
          <button
            onClick={onFix}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
          >
            Fix Configuration
          </button>
        )}
      </div>
    </div>
  );
} 