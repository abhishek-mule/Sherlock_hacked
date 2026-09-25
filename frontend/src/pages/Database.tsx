import { useEffect, useState } from 'react'

export default function Database() {
  const [status, setStatus] = useState<any>(null)
  useEffect(() => {
    const wails = (window as any).go?.main?.App
    if (wails?.DBStatus) wails.DBStatus().then(setStatus).catch(()=>{})
  }, [])
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Database</h2>
      <p className="text-sm text-slate-500 mb-2">SQLite (shipped) — Postgres dump imported locally via explicit flag.</p>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-auto">{status ? JSON.stringify(status, null, 2) : 'Run via Wails for live status, or `go run ./cmd/cli db status`'}</pre>
      <div className="mt-4 text-xs text-slate-500">Default import is synthetic/fixtures only. Use <code>ALLOW_PRIVATE_IMPORT=1 go run ./cmd/cli db import &lt;backup&gt; --include-private</code> for real student_data (local only).</div>
    </div>
  )
}
