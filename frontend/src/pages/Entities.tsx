export default function Entities() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Entities (Graph)</h2>
      <p className="text-slate-500 mb-4">Target → Findings → Evidence → Potential Relationships (never identity claim).</p>
      <div className="border rounded h-64 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400">React Flow graph — connected via App.GetGraph (evidence correlations)</div>
      <p className="text-xs text-slate-400 mt-2">Correlation produces “potential relationship” with score &amp; evidence — not an identity assertion.</p>
    </div>
  )
}
