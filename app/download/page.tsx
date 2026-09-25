"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, Globe, Shield, ExternalLink } from 'lucide-react';

export default function DownloadPage() {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('appinstalled', () => setIsPWAInstalled(true));
    if (window.matchMedia('(display-mode: standalone)').matches) setIsPWAInstalled(true);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Download Sherlock</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Use demo login <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded">porus</code> / <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded">porus</code></p>
        </div>

        <Card className="p-6 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20">
          <div className="flex items-start gap-4">
            <div className="bg-teal-500 p-3 rounded-xl"><Globe className="h-6 w-6 text-white" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Option 1 — Install as App (Recommended)</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">No download, auto-updates, offline, Play-Store-like. Best on Android.</p>
              <ol className="text-sm text-slate-700 dark:text-slate-300 mt-3 list-decimal list-inside space-y-1">
                <li>Open this site in <strong>Chrome</strong> on Android</li>
                <li>Tap <strong>⋮</strong> → <strong>Install app</strong> / <strong>Add to Home Screen</strong></li>
                <li>App appears in drawer as standalone</li>
              </ol>
              {deferredPrompt && <Button onClick={installPWA} className="mt-4 bg-teal-600 hover:bg-teal-700">Install via Browser Prompt</Button>}
              {isPWAInstalled && <p className="text-sm text-teal-700 dark:text-teal-300 mt-3 font-medium">✓ Installed — launch from home screen</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-slate-900 dark:bg-slate-700 p-3 rounded-xl"><Smartphone className="h-6 w-6 text-white" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Option 2 — Download .APK</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">TWA-wrapped APK (same web app, native installer). Requires sideload.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/apk/app-release-signed.apk" download className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg font-medium hover:opacity-90">
                  <Download className="h-5 w-5" /> Download APK
                </a>
                <a href="https://github.com/abhishek-mule/Sherlock_hacked/releases" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border px-5 py-2.5 rounded-lg">
                  Releases <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>1. Tap Download → Open file → Allow `Install unknown apps` → Install</p>
                <p>2. Demo login: <code>porus</code> / <code>porus</code></p>
                <p className="flex items-center gap-1"><Shield className="h-3 w-3" /> APK is signed TWA; for Play Store publish, upload the `.aab` instead.</p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">APK not yet built? Run <code>./scripts/build-apk.sh</code> (see twa/) or check Releases.</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
          <strong>Build APK locally:</strong> <code>./scripts/build-apk.sh sherlock-five.vercel.app</code> — needs JDK 17 + Bubblewrap. Output in <code>twa/app/build/outputs/</code>.
        </Card>
      </div>
    </div>
  );
}
