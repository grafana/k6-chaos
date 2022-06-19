package main

import (
	"go.k6.io/k6-chaos/agent/cmd"
	"github.com/spf13/cobra"
)

func main() {
	var rootCmd = &cobra.Command{
		Use: "chaos-agent",
	}

	rootCmd.AddCommand(cmd.BuildStressCmd())
	rootCmd.Execute()
}

