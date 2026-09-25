export default function Reports() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <p className="text-slate-500 mb-2">Deterministic exports: JSON / CSV / Markdown. Includes provenance, confidence, errors, and correlation notes.</p>
      <div className="mt-4 border rounded p-4 bg-white dark:bg-slate-800 text-sm">
        Use <code>go run ./cmd/cli export &lt;investigation-id&gt; --format json|csv|md</code> or Wails <code>App.ExportReport</code>.
      </div>
    </div>
  )
}
