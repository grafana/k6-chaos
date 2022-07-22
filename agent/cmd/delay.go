package cmd

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"

	"github.com/spf13/cobra"
)

// delayCmd handles network delay command execution
type delayCmd struct {
	iface     string
	average   uint8
	variation uint8
	duration  time.Duration
}

// builds a command for executing netmem delay
func (s *delayCmd) buildNetemDelayCmd() *exec.Cmd {
	return exec.Command(
		"tc",
		"qdisc",
		"add",
		"dev",
		s.iface,
		"root",
		"netem",
		"delay",
		strconv.Itoa(int(s.average))+"ms",
		strconv.Itoa(int(s.variation))+"ms",
	)
}

// builds a command for cleaning netmem
func (s *delayCmd) buildNetemCleanupCmd() *exec.Cmd {
	return exec.Command(
		"tc",
		"qdisc",
		"del",
		"dev",
		s.iface,
		"root",
		"netem",
	)
}

// run network delay disruptor
func (s *delayCmd) run(cmd *cobra.Command, args []string) error {
	duration := int(s.duration.Seconds())
	if duration < 1 {
		return fmt.Errorf("duration must be at least one second")
	}

	// prepare cleanup
	cleaup := s.buildNetemCleanupCmd()
	defer cleaup.Run()

	disruptor := s.buildNetemDelayCmd()
	err := disruptor.Start()
	if err != nil {
		return err
	}

	wc := make(chan error)
	go func() {
		wc <- disruptor.Wait()
	}()

	// wait for given duration or execution error
	for {
		select {
		case err = <-wc:
			if err != nil {
				return err
			}
		case <-time.After(s.duration):
			return nil
		}
	}
}

// BuildDelayCmd returns a cobra command with the specification of the delay command
func BuildDelayCmd() *cobra.Command {
	d := &delayCmd{}
	c := &cobra.Command{
		Use:   "delay",
		Short: "Network package delay disruptor",
		Long: `Disrupts network by introducting delays on packages.
			Requires NET_ADMIM and NET_RAW capabilities on the target interface`,
		RunE: d.run,
	}
	c.Flags().DurationVarP(&d.duration, "duration", "d", 60*time.Second, "duration of the dusruption")
	c.Flags().Uint8VarP(&d.average, "average", "a", 100, "average package delay (milseconds)")
	c.Flags().Uint8VarP(&d.variation, "variation", "v", 0, "variation in package delay (milseconds")
	c.Flags().StringVarP(&d.iface, "interface", "i", "eth0", "interface to disrupt")

	return c
}
