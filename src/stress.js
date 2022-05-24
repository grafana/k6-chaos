import { JobRunner } from './utils.js';

export class StressNodesAttack {
    constructor(client) {
        this.client = client
	this.jobRunner = new JobRunner(client)
        this.name = 'stress-nodes'
        this.namespace = 'default'
        this.cpu = '0'
        this.io = '0'
        this.vm = '0'
        this.vmBytes = '256MB'
        this.timeout = '10'
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
    noAutocleanup() {
	this.autocleanup = false
	return this
    }
    withCPU(cpu) {
        this.cpu = cpu
        return this
    }
    withIO(io) {
        this.io = io
        return this
    }
    withVM(vm) {
        this.vm = vm
        return this
    }
    withVMBytes(vmBytes) {
        this.vmBytes = vmBytes
        return this
    }
    withTimeout(timeout) {
        this.timeout = timeout
        return this
    }
    start() {
        this.jobs = this.jobRunner.runJobOnNodes(
            this.namespace,
            this.name,
            this.nodes,
            'progrium/stress',
            ['stress', '--cpu', this.cpu, '--io', this.io, '--vm', this.vm, '--vm-bytes', this.vmBytes, '--timeout', this.timeout],
	    this.autocleanup
        )
        return this.name
    }
    clean() {
        this.jobRunner.cleanJobs(this.namespace, this.jobs)
        return this.name
    }
}
