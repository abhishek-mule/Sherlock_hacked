// Command sherlock-hacked is the root Go entrypoint for the Sherlock Hacked
// local-first intelligence platform.
//
// This file deliberately has no //go:embed of frontend/dist. The frontend
// bundle is a build artifact produced by `wails build` / `vite build` and is
// gitignored, so embedding it here would make `go vet` and `go build` fail on a
// clean checkout. Wails generates its own asset-embedding entrypoint for the
// desktop binary; this file only exists so the root package (which also holds
// the Wails bindings in app.go) compiles as a main package.
//
// Usage:
//	go run ./cmd/cli --help      CLI (shares the same internal/ core)
//	wails dev                   desktop GUI (requires the Wails toolchain)
//	cd frontend && npm run dev  web frontend against the local dataset
package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "version", "--version", "-v":
			fmt.Println("Sherlock Hacked 1.0.0")
			return
		}
	}
	fmt.Fprintln(os.Stderr, "Sherlock Hacked — Go core ready.")
	fmt.Fprintln(os.Stderr, "  CLI:        go run ./cmd/cli --help")
	fmt.Fprintln(os.Stderr, "  Desktop:    wails dev        (requires the Wails toolchain)")
	fmt.Fprintln(os.Stderr, "  Dataset:    python3 scripts/ingest.py")
	fmt.Fprintln(os.Stderr, "  Web:        cd frontend && npm run dev")
}
