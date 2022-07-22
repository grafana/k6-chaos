import { JobRunner } from './utils.js';

export class NodeDisruptor {
    constructor(client, options = {}) {
        this.client = client
	    this.jobRunner = new JobRunner(client)
        this.name = options.name | 'k6-chaos'
        this.namespace = options.namespace | 'default'
        this.autocleanup = options.auto_cleanup | true
    }

    stress(nodes, options) {
        const cores = options.cores || 1
        const cpuLoad = options.cpu_load || 100
        const duration = options.duration || "1m"
        const command = [
            'k6-chaos-agent',
            'stress',
            '-c',
            cores,
            '-l',
            cpuLoad,
            '-d',
            duration
        ]

        this.jobs = this.jobRunner.runJobOnNodes(
            this.namespace,
            this.name,
            nodes,
            'grafana/k6-chaos',
            command,
            this.autocleanup
        )
    }

    clean() {
        this.jobRunner.cleanJobs(this.namespace, this.jobs)
        return this.name
    }
}
