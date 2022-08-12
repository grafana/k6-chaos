package main

import (
	"github.com/spf13/cobra"
	"go.k6.io/k6-chaos/agent/cmd"
)

func main() {
	var rootCmd = &cobra.Command{
		Use: "chaos-agent",
	}

	rootCmd.AddCommand(cmd.BuildStressCmd())
	rootCmd.AddCommand(cmd.BuildDelayCmd())
	rootCmd.AddCommand(cmd.BuildHttpCmd())
	rootCmd.Execute()
}
