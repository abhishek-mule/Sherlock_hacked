import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { Inter, Poppins } from 'next/font/google'
import { ClientOnly } from '@/components/client-only'
import { ApiStatusBanner } from '@/components/ApiStatusBanner'

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sherlock - Student OSINT Finder',
  description: 'Advanced student information discovery platform',
  keywords: 'student database, OSINT, student information, educational data',
  authors: [{ name: 'Sherlock Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0f172a',
}

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} scroll-smooth`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
        {/* Add web app capable meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Sherlock" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={cn(
        "min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-200 selection:text-teal-900 dark:selection:bg-teal-800 dark:selection:text-teal-100",
        inter.className
      )}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Toaster position="top-center" />
            <ClientOnly>
              <ApiStatusBanner />
            </ClientOnly>
            <main className="flex-grow relative">
              {children}
            </main>
            {/* Page bottom padding to account for bottom navigation */}
            <div className="h-20 md:h-16"></div>
          </div>
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
            
            // Add smooth scroll behavior for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
              anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                  targetElement.scrollIntoView({
                    behavior: 'smooth'
                  });
                }
              });
            });
          `
        }} />
      </body>
    </html>
  )
}