GOLANGCI_LINT_VERSION = $(shell head -n 1 .golangci.yml | tr -d '\# ')
TMPDIR ?= /tmp

all: build

clean:
	rm -rf bin/

build:
	go build  -o bin/ ./agent/

format:
	gofmt ./...

test:
	go test -race  ./...

container:
	docker build --rm --pull --no-cache -t grafana/k6-chaos .

.PHONY: clean build format test container
