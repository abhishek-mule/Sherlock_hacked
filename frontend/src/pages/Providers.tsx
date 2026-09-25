import { useEffect, useState } from 'react'

type Prov = { id: string; name: string; types: string[] }

export default function Providers() {
  const [provs, setProvs] = useState<Prov[]>([])
  const [err, setErr] = useState('')
  useEffect(() => {
    const wails = (window as any).go?.main?.App
    if (wails?.ListProviders) {
      wails.ListProviders().then(setProvs).catch((e: any) => setErr(String(e)))
    } else {
      setProvs([
        { id: 'github', name: 'GitHub', types: ['username'] },
        { id: 'reddit', name: 'Reddit', types: ['username'] },
        { id: 'rdap', name: 'RDAP (domain)', types: ['domain'] },
        { id: 'url-metadata', name: 'URL Metadata', types: ['url'] },
        { id: 'phone-format', name: 'Phone', types: ['phone'] },
        { id: 'crypto-format', name: 'Crypto', types: ['crypto'] },
        { id: 'onion-search', name: 'Onion Search (gated)', types: ['username','domain'] },
      ])
    }
  }, [])
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Providers</h2>
      <p className="text-slate-500 mb-4">Isolated modules • rate-limited • status ≠ FOUND is explicit.</p>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <div className="grid gap-2">
        {provs.map(p => (
          <div key={p.id} className="border rounded p-3 bg-white dark:bg-slate-800 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-500 font-mono">{p.id}</div>
            </div>
            <div className="flex gap-1">
              {p.types.map(t => <span key={t} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
