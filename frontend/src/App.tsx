import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import Investigate from './pages/Investigate'
import Cases from './pages/Cases'
import Evidence from './pages/Evidence'
import Entities from './pages/Entities'
import Providers from './pages/Providers'
import Database from './pages/Database'
import Reports from './pages/Reports'

const qc = new QueryClient()

type Page = 'dashboard' | 'investigate' | 'cases' | 'evidence' | 'entities' | 'providers' | 'database' | 'reports'

export default function App() {
  const [page, setPage] = useState<Page>('investigate')
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex">
        <aside className="w-56 border-r bg-white dark:bg-slate-950 p-4 flex flex-col gap-2">
          <h1 className="font-bold text-lg mb-4">Sherlock Hacked</h1>
          <span className="text-xs text-emerald-600 mb-2">● Local DB</span>
          {(['dashboard','investigate','cases','evidence','entities','providers','database','reports'] as Page[]).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`text-left px-3 py-2 rounded capitalize ${page===p ? 'bg-teal-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
          ))}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {page==='dashboard' && <Dashboard />}
          {page==='investigate' && <Investigate />}
          {page==='cases' && <Cases />}
          {page==='evidence' && <Evidence />}
          {page==='entities' && <Entities />}
          {page==='providers' && <Providers />}
          {page==='database' && <Database />}
          {page==='reports' && <Reports />}
        </main>
      </div>
    </QueryClientProvider>
  )
}
