FROM golang:1.18-alpine as builder
WORKDIR /k6-chaos
ADD . .
RUN go build -o bin/ ./agent/ 
RUN ls

FROM alpine:3.15
COPY --from=builder /k6-chaos/bin/agent /usr/bin/k6-chaos-agent
RUN apk update && apk add stress-ng iproute2

WORKDIR /home/k6-chaos
