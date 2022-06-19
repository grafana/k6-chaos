package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)


func BuildStressCmd() *cobra.Command {
	c:= &cobra.Command {
		Use: "stress",
		Short: "Resource stressor",
		Long: `Stress resources in a executing environment by running
			running one or more processes that consume resources`,
		Run: func(cmd *cobra.Command, args []string)  {
			fmt.Println("Executing stressor ...")
		},
	}

	return c
}

