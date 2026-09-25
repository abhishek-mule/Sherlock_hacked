package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"

	"github.com/abhishek-mule/Sherlock_hacked/internal/config"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/target"
	"github.com/abhishek-mule/Sherlock_hacked/internal/db"
	imp "github.com/abhishek-mule/Sherlock_hacked/internal/import"
	"github.com/abhishek-mule/Sherlock_hacked/internal/providers"
	"github.com/abhishek-mule/Sherlock_hacked/internal/core/discovery"
)

func main() {
	root := &cobra.Command{
		Use:   "sherlock-hacked",
		Short: "Sherlock Hacked — local-first OSINT (Go core, SQLite)",
	}

	root.AddCommand(cmdDB(), cmdProviders(), cmdScan(), cmdInvestigate(), cmdExport())

	if err := root.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func openDB() (*db.DB, error) {
	return db.Open(config.DatabaseURL())
}

func cmdDB() *cobra.Command {
	c := &cobra.Command{Use: "db", Short: "Database operations"}
	c.AddCommand(
		&cobra.Command{
			Use: "status", Short: "Show DB status",
			RunE: func(cmd *cobra.Command, args []string) error {
				d, err := openDB()
				if err != nil { return err }
				defer d.Close()
				st, err := d.Status()
				if err != nil { return err }
				b, _ := json.MarshalIndent(st, "", "  ")
				fmt.Println(string(b))
				return nil
			},
		},
		&cobra.Command{
			Use: "import <backup>", Short: "Import Postgres backup into SQLite (default synthetic; --include-private for real data)",
			Args: cobra.ExactArgs(1),
			RunE: func(cmd *cobra.Command, args []string) error {
				includePrivate, _ := cmd.Flags().GetBool("include-private")
				if includePrivate && !config.IsPrivateImportAllowed() && os.Getenv("ALLOW_PRIVATE_IMPORT") == "" {
					fmt.Fprintln(os.Stderr, "WARNING: --include-private will store sensitive PII locally. Set ALLOW_PRIVATE_IMPORT=1 to confirm.")
				}
				d, err := openDB()
				if err != nil { return err }
				defer d.Close()
				rep, err := imp.ImportDB(d, args[0], includePrivate)
				if err != nil { return err }
				b, _ := json.MarshalIndent(rep, "", "  ")
				fmt.Println(string(b))
				return nil
			},
		},
	)
	c.Commands()[1].Flags().Bool("include-private", false, "Include sensitive student_data (local only, requires confirmation)")
	return c
}

func cmdProviders() *cobra.Command {
	return &cobra.Command{
		Use: "providers", Short: "List providers",
		RunE: func(cmd *cobra.Command, args []string) error {
			r := providers.DefaultRegistry()
			for _, p := range r.List() {
				fmt.Printf("%-16s %-20s %v\n", p.ID(), p.Name(), p.TargetTypes())
			}
			return nil
		},
	}
}

func cmdScan() *cobra.Command {
	return &cobra.Command{
		Use: "scan <type> <value>", Short: "Scan a target (username|email|phone|domain|ip|url)",
		Args: cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			typ := target.TargetType(args[0])
			t, err := target.Normalize(args[1], typ)
			if err != nil { return err }
			r := providers.DefaultRegistry()
			eng := discovery.New(r, 5, 8*time.Second)
			ctx := context.Background()
			results := eng.Investigate(ctx, t)
			for _, res := range results {
				ev := res.Evidence
				mark := "[?]"
				switch ev.Status {
				case "FOUND": mark = "[+]"
				case "NOT_FOUND": mark = "[-]"
				case "RATE_LIMITED": mark = "[!]"
				case "BLOCKED": mark = "[!]"
				case "INCONCLUSIVE": mark = "[?]"
				case "ERROR": mark = "[x]"
				}
				fmt.Printf("%s %-16s %-12s %-12s %s\n", mark, ev.Provider, ev.Status, ev.Confidence, ev.SourceURL)
			}
			return nil
		},
	}
}

func cmdInvestigate() *cobra.Command {
	return &cobra.Command{
		Use: "investigate <target>", Short: "Auto-detect type and investigate",
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			raw := args[0]
			typ, ok := target.AutoDetect(raw)
			if !ok {
				typ = target.TypeUsername
			}
			t, err := target.Normalize(raw, typ)
			if err != nil { return err }
			fmt.Printf("Target: %s (%s) normalized=%s\n", t.Raw, t.Type, t.Normalized)
			r := providers.DefaultRegistry()
			eng := discovery.New(r, 5, 8*time.Second)
			results := eng.Investigate(context.Background(), t)
			// Persist investigation
			d, err := openDB()
			if err == nil {
				defer d.Close()
				id := fmt.Sprintf("inv-%d", time.Now().UnixNano())
				_, _ = d.SQL.Exec(`INSERT INTO investigations(id, target_raw, target_normalized, target_type, status) VALUES(?,?,?,?,?)`, id, t.Raw, t.Normalized, string(t.Type), "completed")
				for _, res := range results {
					ev := res.Evidence
					obsID := fmt.Sprintf("obs-%d-%s", time.Now().UnixNano(), ev.Provider)
					ov, nv, errStr, snip := "", "", "", ""
					if ev.ObservedValue != nil { ov = *ev.ObservedValue }
					if ev.NormalizedValue != nil { nv = *ev.NormalizedValue }
					if ev.Error != nil { errStr = *ev.Error }
					if ev.RawSnippet != nil { snip = *ev.RawSnippet }
					_, _ = d.SQL.Exec(`INSERT INTO observations(id, investigation_id, provider, query, observed_value, normalized_value, status, confidence, source_url, evidence_type, collection_method, raw_snippet, error, collected_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
						obsID, id, ev.Provider, ev.Query, ov, nv, string(ev.Status), string(ev.Confidence), ev.SourceURL, ev.EvidenceType, ev.CollectionMethod, snip, errStr, ev.Timestamp.Format(time.RFC3339))
				}
				fmt.Printf("\nSaved investigation %s (%d evidences)\n", id, len(results))
			}
			for _, res := range results {
				ev := res.Evidence
				mark := "[?]"
				switch ev.Status {
				case "FOUND": mark = "[+]"
				case "NOT_FOUND": mark = "[-]"
				case "RATE_LIMITED", "BLOCKED": mark = "[!]"
				case "ERROR": mark = "[x]"
				}
				fmt.Printf("%s %-16s %-12s %-12s\n", mark, ev.Provider, ev.Status, ev.Confidence)
			}
			return nil
		},
	}
}

func cmdExport() *cobra.Command {
	c := &cobra.Command{
		Use:   "export <investigation-id>",
		Short: "Export investigation (json|csv|md)",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			format, _ := cmd.Flags().GetString("format")
			id := args[0]
			d, err := openDB()
			if err != nil { return err }
			defer d.Close()
			rows, err := d.SQL.Query(`SELECT provider, query, status, confidence, source_url, observed_value FROM observations WHERE investigation_id=?`, id)
			if err != nil { return err }
			defer rows.Close()
			type row struct {
				Provider string `json:"provider"`
				Query string `json:"query"`
				Status string `json:"status"`
				Confidence string `json:"confidence"`
				SourceURL string `json:"source_url"`
				ObservedValue string `json:"observed_value"`
			}
			var out []row
			for rows.Next() {
				var r row
				_ = rows.Scan(&r.Provider, &r.Query, &r.Status, &r.Confidence, &r.SourceURL, &r.ObservedValue)
				out = append(out, r)
			}
			switch format {
			case "csv":
				fmt.Println("provider,query,status,confidence,source_url,observed_value")
				for _, r := range out {
					fmt.Printf("%s,%s,%s,%s,%s,%s\n", r.Provider, r.Query, r.Status, r.Confidence, r.SourceURL, r.ObservedValue)
				}
			case "md":
				fmt.Printf("# Investigation %s\n\n| Provider | Status | Confidence | Source |\n|---|---|---|---|\n", id)
				for _, r := range out {
					fmt.Printf("| %s | %s | %s | %s |\n", r.Provider, r.Status, r.Confidence, r.SourceURL)
				}
			default:
				b, _ := json.MarshalIndent(out, "", "  ")
				fmt.Println(string(b))
			}
			return nil
		},
	}
	c.Flags().String("format", "json", "json|csv|md")
	return c
}


