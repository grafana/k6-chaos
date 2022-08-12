import { sleep } from 'k6';
import { labelMatcher } from './utils.js';

const RANDOM_PICKER = 'random'

export class PodDisruptor {
    constructor(client, options) {
        this.client = client
        this.options = options
        this.selector = options.selector || {}
        this.namespace = options.namespace || 'default'
        this.picker = options.picker || RANDOM_PICKER
        this. pod =  this._selectPod()
        this.client.pods.addEphemeralContainer(
            this.pod,
            this.namespace,
            {
                name: "k6-chaos",
                image: "grafana/k6-chaos",
                pull_policy: "IfNotPresent",
                capabilities: ["NET_ADMIN","NET_RAW"],
            }   
        )
        sleep(10)  // give time for the container to start
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
        const delay = options.delay || 100
        const variation = options.variation || 0
	    const target = options.target || 80
	    const port = options.port || 8080
        const error_code = options.error_code || 0
        const error_rate = options.error_rate || 0.0
        const command = [
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

