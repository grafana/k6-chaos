import { sleep } from 'k6';

class PodDelayAttack {
    constructor(client, pod, namespace) {
        this.client = client
        this.pod = pod
        this.namespace = namespace
        this.name = 'pod-delay-attack'
        this.duration = '30s'
        this.delay = 100
        this.variation = 0 
    }
    withDelay(delay) {
        this.delay = delay.toString()
        return this
    }
    withVariation(variation) {
        this.variation = variation.toString()
        return this
    }
    withDuration(duration) {
        this.duration = duration
        return this
    }
    execute() {
        this.client.pods.exec({
            pod: this.pod,
            namespace: this.namespace,
            container: "k6-chaos",
            command: ["k6-chaos-agent", "delay", "-a", this.delay,"-v", this.variation, "-d", this.duration]
        })
        return this.name
    }
}

export class PodAttack {
    constructor(client) {
        this.client = client
        this.name = 'pod-attack'
        this.namespace = 'default'
    }
    withName(name) {
        this.name = name
        return this
    }
    inNamespace(namespace) {
        this.namespace = namespace
        return this
    }
    inPod(pod) {
        this.pod = pod
        return this
    }
    install() {
        this.client.pods.addEphemeralContainer(
            this.pod,
            this.namespace,
    	    {
                name: "k6-chaos",
                image: "k6-chaos",
		pull_policy: "IfNotPresent",
                capabilities: ["NET_ADMIN","NET_RAW"],
            }   
        )
	sleep(5)
        return this
    }
    startDelayAttack(){
       return new PodDelayAttack(this.client, this.pod, this.namespace)
    }
}

