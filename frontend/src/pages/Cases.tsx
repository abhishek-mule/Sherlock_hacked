import { useEffect, useState } from 'react'

export default function Cases() {
  const [cases, setCases] = useState<any[]>([])
  useEffect(() => {
    const wails = (window as any).go?.main?.App
    if (wails?.ListInvestigations) wails.ListInvestigations(20).then(setCases).catch(()=>{})
  }, [])
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cases</h2>
      <p className="text-slate-500 mb-4">Persisted investigations — evidence, confidence, timeline.</p>
      <div className="border rounded bg-white dark:bg-slate-800 divide-y">
        {cases.length===0 && <div className="p-4 text-slate-400">No cases yet. Run an investigation.</div>}
        {cases.map((c:any)=><div key={c.id} className="p-3"><div className="font-mono text-sm">{c.target_raw} <span className="text-xs bg-slate-100 px-2 py-1 rounded">{c.target_type}</span></div><div className="text-xs text-slate-500">{c.id} • {c.created_at}</div></div>)}
      </div>
    </div>
  )
}
