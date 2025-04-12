import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sherlock - Student OSINT Finder',
  description: 'Advanced student information discovery platform',
}

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
        {/* App height adjustment script for mobile */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Fix the 100vh issue on mobile browsers
            const appHeight = () => {
              const doc = document.documentElement;
              doc.style.setProperty('--app-height', \`\${window.innerHeight}px\`);
            };
            window.addEventListener('resize', appHeight);
            appHeight();
          `
        }} />
      </body>
    </html>
  )
}