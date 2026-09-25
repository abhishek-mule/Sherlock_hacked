package main

import (
	"embed"
	"log"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Standalone mode without Wails (for CI/dev without Wails binary):
	// If Wails is available, this would be replaced by wails.Run(&options.App{...}).
	// For now we provide a minimal HTTP fallback so `go run .` does not crash.
	log.Println("Sherlock Hacked — Go core ready. Run `go run ./cmd/cli` for CLI or `wails dev` for desktop (requires Wails).")
	_ = assets
}
