import { JobRunner } from './utils.js';
import { labelMatcher } from './utils.js';

const RANDOM_PICKER = 'random'

export class NodeDisruptor {
    constructor(client, options = {}) {
        this.client = client
	    this.jobRunner = new JobRunner(client)
        this.name = options.name || 'k6-chaos'
        this.namespace = options.namespace || 'default'
        this.autocleanup = options.auto_cleanup || true
        this.selector = options.selector || {}
        this.picker = options.picker || RANDOM_PICKER
        this.nodes = this._selectNodes()
    }

    _selectNodes() {
        const nodes = this.client.nodes
            .list()
            .filter(node => labelMatcher(this.selector, node.labels))
            .map(node => node.name)

            if (nodes.length == 0) {
                throw "No node matches selector"
            }
            if (this.picker == RANDOM_PICKER) {
                return nodes.slice(0,1)
            }

            throw "unsoported node picker: " + this.picker
    }

    stress(options) {
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
            this.nodes,
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
