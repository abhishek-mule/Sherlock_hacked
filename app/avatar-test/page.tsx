'use client';

import React, { useState } from 'react';
import { RandomProfilePicture } from '@/components/RandomProfilePicture';
import { generateAvatar } from '@/lib/avatar-utils';
import Image from 'next/image';

export default function AvatarTestPage() {
  const [seed, setSeed] = useState('test123');
  const [size, setSize] = useState(100);
  const [sansEnv, setSansEnv] = useState(false);
  const [svgCode, setSvgCode] = useState(() => generateAvatar('test123', false));

  const handleGenerateAvatar = () => {
    try {
      const newSvgCode = generateAvatar(seed, sansEnv);
      setSvgCode(newSvgCode);
    } catch (error) {
      console.error('Error generating avatar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Multiavatar Test Page</h1>
          <p className="text-gray-600 dark:text-gray-300">Testing local Multiavatar implementation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">RandomProfilePicture Component</h2>
              <div className="flex items-center justify-center">
                <RandomProfilePicture 
                  seed={seed} 
                  size={size} 
                  className="border-4 border-white dark:border-gray-700 shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="seed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Value
                </label>
                <input
                  id="seed"
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size (px)
                </label>
                <input
                  id="size"
                  type="number"
                  min="50"
                  max="300"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="sansEnv"
                  type="checkbox"
                  checked={sansEnv}
                  onChange={(e) => setSansEnv(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="sansEnv" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Without background (sansEnv)
                </label>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateAvatar}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
              >
                Generate Avatar
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Raw SVG Code</h2>
            <div className="h-64 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <pre className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{svgCode}</pre>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Direct SVG Rendering</h3>
              <div className="flex justify-center bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <div dangerouslySetInnerHTML={{ __html: svgCode }} style={{ width: size, height: size }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {['user1', 'user2', 'user3', 'user4'].map((testSeed) => (
            <div key={testSeed} className="flex flex-col items-center space-y-2">
              <RandomProfilePicture seed={testSeed} size={80} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{testSeed}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 