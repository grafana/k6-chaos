import { sleep } from 'k6';

export class PodDisruptor {
    constructor(client, pod, namespace, options) {
        this.client = client
        this.pod = pod
        this.namespace = namespace
        this.options = options
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

    kill() {
        this.client.pods.delete(this.pod, this.namespace)
    }
}

