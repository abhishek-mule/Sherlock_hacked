import { useState } from 'react'

type Evidence = {
  provider: string
  status: string
  confidence: string
  source_url: string
}

export default function Investigate() {
  const [raw, setRaw] = useState('johndoe')
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState('')
  const [id, setId] = useState('')

  async function start() {
    setLoading(true)
    try {
      // Wails binding if available, otherwise fallback to dev note
      const wails = (window as any).go?.main?.App
      if (wails?.Investigate) {
        const res = await wails.Investigate({ raw, type: '' })
        setId(res.id)
        setTarget(`${res.target.raw} (${res.target.type})`)
        setEvidences(res.evidences.map((e: any) => ({
          provider: e.provider, status: e.status, confidence: e.confidence, source_url: e.source_url
        })))
      } else {
        // Demo without Wails — simulate
        setTarget(raw + ' (demo — Wails not running)')
        setEvidences([
          { provider: 'github', status: 'FOUND', confidence: 'WEAK', source_url: `https://github.com/${raw}` },
          { provider: 'reddit', status: 'NOT_FOUND', confidence: 'NEGATIVE', source_url: `https://reddit.com/user/${raw}` },
        ])
        setId('demo-'+Date.now())
      }
    } catch (e: any) {
      console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Investigation</h2>
      <div className="flex gap-2 mb-4">
        <input value={raw} onChange={e=>setRaw(e.target.value)} placeholder="username / email / phone / domain" className="flex-1 border rounded px-3 py-2 dark:bg-slate-800" />
        <button onClick={start} disabled={loading} className="bg-teal-600 text-white px-6 py-2 rounded disabled:opacity-50">{loading?'Running...':'Start Investigation'}</button>
      </div>
      {id && <div className="text-sm text-slate-500 mb-2">Investigation {id} — Target {target}</div>}
      {loading && <div className="h-2 bg-slate-200 rounded overflow-hidden mb-4"><div className="h-full bg-teal-600 animate-pulse w-3/4" /></div>}
      <div className="border rounded divide-y bg-white dark:bg-slate-800">
        {evidences.length===0 && <div className="p-4 text-slate-500">No evidence yet — start an investigation.</div>}
        {evidences.map(e=>(
          <div key={e.provider} className="p-3 flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded font-mono ${e.status==='FOUND'?'bg-emerald-100 text-emerald-700':e.status==='NOT_FOUND'?'bg-slate-100':e.status==='RATE_LIMITED'?'bg-amber-100': 'bg-yellow-100'}`}>{e.status}</span>
            <span className="font-medium w-32">{e.provider}</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{e.confidence}</span>
            <a href={e.source_url} target="_blank" rel="noreferrer" className="text-xs text-teal-600 truncate">{e.source_url}</a>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">Evidence → Correlation → Confidence → Timeline. Correlation is potential relationship only.</p>
    </div>
  )
}
