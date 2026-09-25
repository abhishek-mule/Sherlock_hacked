import { useEffect, useState } from 'react'

export default function Evidence() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    if (q.length < 2) return
    const wails = (window as any).go?.main?.App
    if (wails?.SearchEntities) {
      wails.SearchEntities(q).then((r: any) => setRows(r)).catch(()=>{})
    }
  }, [q])
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Evidence & Entities</h2>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search local entities (offline FTS)" className="w-full border rounded px-3 py-2 mb-4 dark:bg-slate-800" />
      <div className="text-sm text-slate-500 mb-2">Evidence is sourced, confidence-graded, and never claims identity without human review.</div>
      <div className="border rounded bg-white dark:bg-slate-800 divide-y">
        {rows.length===0 && <div className="p-4 text-slate-400">Type to search local synthetic DB (offline).</div>}
        {rows.map((r,i)=><div key={i} className="p-3 flex justify-between"><span>{r.value || r.Value}</span><span className="text-xs bg-slate-100 px-2 py-1 rounded">{r.type || r.Type}</span></div>)}
      </div>
    </div>
  )
}
