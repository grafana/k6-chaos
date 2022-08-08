package cmd

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os/exec"
	"strconv"
	"time"

	"github.com/spf13/cobra"
)

// delayCmd handles network delay command execution
type httpCmd struct {
	average   uint
	variation uint
	duration  time.Duration
	iface     string
	port      uint
	target    uint
}

type Action string

const (
	ADD Action = "-A"
	DELETE Action = "-D"
)

type proxy struct {
	port uint
	target uint
	delay  uint
	srv *http.Server
}

// builds a command for adding or removing a transparent proxy using iptables
func (s *httpCmd) buildIptablesCmd(action Action) *exec.Cmd {
	return exec.Command(
		"iptables",
		"-t",
		"nat",
		string(action),
		"PREROUTING",
		"-i",
	        s.iface,	
		"-p",
		"tcp",
		"--dport",
		strconv.Itoa(int(s.target)),
		"-j",
		"REDIRECT",
		"--to-port",
		strconv.Itoa(int(s.port)),
	)
}

// run http disruptor
func (s *httpCmd) run(cmd *cobra.Command, args []string) error {
	duration := int(s.duration.Seconds())
	if duration < 1 {
		return fmt.Errorf("duration must be at least one second")
	}

	p := proxy{
		port: s.port,
		target: s.target,
		delay: s.average,
	}

	wc := make(chan error)
	go func() {
		wc <- p.Start()
	}()

	defer func() {
		s.buildIptablesCmd(DELETE).Run()
		p.Stop()
	}()

	err := s.buildIptablesCmd(ADD).Run()
	if err != nil {
		return err
	}

	// wait for given duration or proxy server error
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

// BuildHttpCmd returns a cobra command with the specification of the http command
func BuildHttpCmd() *cobra.Command {
	d := &httpCmd{}
	c := &cobra.Command{
		Use:   "http",
		Short: "http disruptor",
		Long: `Disrupts http request by introducting delays.
			Requires NET_ADMIM and NET_RAW capabilities for setting iptable rules`,
		RunE: d.run,
	}
	c.Flags().DurationVarP(&d.duration, "duration", "d", 60*time.Second, "duration of the dusruption")
	c.Flags().UintVarP(&d.average, "average", "a", 100, "average request delay (milseconds)")
	c.Flags().UintVarP(&d.variation, "variation", "v", 0, "variation in request delay (milseconds")
	c.Flags().StringVarP(&d.iface, "interface", "i", "eth0", "interface to disrupt")
	c.Flags().UintVarP(&d.port, "port", "p", 8080, "port the proxy will listen to")
	c.Flags().UintVarP(&d.target, "target", "t", 80, "port the proxy will redirect request to")

	return c
}


func (p proxy)Start() error {
    // define origin server URL
    originServerURL, err := url.Parse(fmt.Sprintf("http://127.0.0.1:%d", p.target))
    if err != nil {
	    return err
    }

    reverseProxy := http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
	req.Host = originServerURL.Host
        req.URL.Host = originServerURL.Host
        req.URL.Scheme = originServerURL.Scheme
        req.RequestURI = ""
        originServerResponse, err := http.DefaultClient.Do(req)
	time.Sleep(time.Duration(p.delay) * time.Millisecond)
        if err != nil {
            rw.WriteHeader(http.StatusInternalServerError)
            _, _ = fmt.Fprint(rw, err)
            return
        }

        // return response to the client
        rw.WriteHeader(http.StatusOK)
        io.Copy(rw, originServerResponse.Body)
    })

    p.srv = &http.Server{
	    Addr: fmt.Sprintf(":%d", p.port),
	    Handler: reverseProxy,
    }

    return p.srv.ListenAndServe()
}

func (p proxy)Stop() error {
	if p.srv != nil {
		return p.srv.Shutdown(context.Background())
	}
	return nil
}

