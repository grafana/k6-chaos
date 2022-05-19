import { JobRunner } from './utils.js';

export class StressNodesAttack {
    constructor(client) {
        this.client = client
	this.jobRunner = new JobRunner(client)
        this.name = 'stress-nodes'
        this.namespace = 'default'
        this.cores = 1
        this.cpuLoad = 0
        this.duration = '30s'
        this.autocleanup = true
    }
    inNamespace(namespace) {
        this.namespace = namespace
        return this
    }
    inNodes(nodes) {
        this.nodes = nodes
        return this
    }
    withName(name) {
        this.name = name
        return this
    }
    withCores(cores) {
        this.cores = cores
        return this
    }
    withCpuLoad(load) {
        this.cpuLoad = load
        return this
    }
    withDuration(duration) {
        this.duration = duration
        return this
    }
    noAutocleanup() {
	this.autocleanup = false
    }
    start() {
        this.jobs = this.jobRunner.runJobOnNodes(
            this.namespace,
            this.name,
            this.nodes,
            'grafana/k6-chaos',
            ['stress', '-c', this.cores,'-l', this.cpuLoad, '-d', this.duration],
            this.autocleanup
        )
        return this.name
    }
    clean() {
        this.jobRunner.cleanJobs(this.namespace, this.jobs)
        return this.name
    }
}
