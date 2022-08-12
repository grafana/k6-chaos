import { sleep } from 'k6';
import { labelMatcher } from './utils.js';

const RANDOM_PICKER = 'random'

export class PodDisruptor {
    constructor(client, options) {
        this.client = client
        this.options = options
        this.wait = options.wait || "30s"
        this.selector = options.selector || {}
        this.namespace = options.namespace || 'default'
        this.picker = options.picker || RANDOM_PICKER
        this.pod =  this._selectPod()
        this._addChaosAgent()
    }

    _addChaosAgent() {
        const pod = this.client.pods.get(this.pod, this.namespace)
        for (const c of pod.spec.ephemeral_containers) {
            if (c.name == "k6-chaos" ) {
                return
            }
        }

        this.client.pods.addEphemeralContainer(
            this.pod,
            this.namespace,
            {
                name: "k6-chaos",
                image: "grafana/k6-chaos",
                pull_policy: "IfNotPresent",
                capabilities: ["NET_ADMIN","NET_RAW"],
                wait: this.wait
            }   
        )
    }

    _selectPod() {
        let pods = this.client.pods
            .list(this.namespace)
            .filter(pod => { return labelMatcher(this.selector, pod.labels) })

        if (pods.length == 0) {
            throw "No pod matches selector"
        }
        if (this.picker == RANDOM_PICKER) {
            return pods[0].name
        }

        throw "unsoported pod picker: " + this.picker
    }

    slowdownNetwork(options){
        let duration = options.duration || '30s'
        let delay = options.delay || 100
        let variation = options.variation || 0 
        this.client.pods.exec({
            pod: this.pod,
            namespace: this.namespace,
            container: "k6-chaos",
            command: ["k6-chaos-agent", "delay", "-a", delay,"-v", variation, "-d", duration]
        })
        return this.name
    }

    disruptHttp(options){
        const duration = options.duration || '30s'
        const delay = options.delay || 0
        const variation = options.variation || 0
	    const target = options.target || 80
	    const port = options.port || 8080
        const error_code = options.error_code || 0
        const error_rate = options.error_rate || 0.0
        const exclude = options.exclude || []
        let command = [
            "k6-chaos-agent",
            "http",
            "-a", delay,
            "-v", variation,
            "-d", duration,
            "-e", error_code,
            "-r", error_rate,
            "-p", port,
            "-t", target
        ]
        exclude.forEach(e => {
            command = command.concat("-x", e)
        })
        this.client.pods.exec({
            pod: this.pod,
            namespace: this.namespace,
            container: "k6-chaos",
            command: command
        })
        return this.name
    }

    kill() {
        this.client.pods.delete(this.pod, this.namespace)
    }
}

