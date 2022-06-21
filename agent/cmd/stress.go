package cmd

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"

	"github.com/spf13/cobra"
)

// stressCmd handles stress command execution
type stressCmd struct {
	cores    uint8
	cpuLoad  uint8
	duration time.Duration
}

// run stressor
func (s *stressCmd) run(cmd *cobra.Command, args []string) error {
	// no stress
	if s.cpuLoad == 0 {
		return nil
	}
	if s.cpuLoad > 100 {
		return fmt.Errorf("load must be <= 100: %i", s.cpuLoad)
	}
	duration := int(s.duration.Seconds())
	if duration < 1 {
		return fmt.Errorf("duration must be at least one second")
	}
	stressor := exec.Command(
		"stress-ng",
		"-c",
		strconv.Itoa(int(s.cores)),
		"-l",
		strconv.Itoa(int(s.cpuLoad)),
		"-t",
		strconv.Itoa(duration),
	)
	err := stressor.Run()
	return err
}

func BuildStressCmd() *cobra.Command {
	s := &stressCmd{}
	c := &cobra.Command{
		Use:   "stress",
		Short: "Resource stressor",
		Long: `Stress resources in a executing environment by running
			running one or more processes that consume resources`,
		RunE: s.run,
	}
	c.Flags().Uint8VarP(&s.cores, "cpu-cores", "c", 0, "number of cpu cores to stress")
	c.Flags().Uint8VarP(&s.cpuLoad, "cpu-load", "l", 0, "percentage of cpu utilization (per core)")
	c.Flags().DurationVarP(&s.duration, "duration", "d", 60*time.Second, "duration of the stress")

	return c
}
