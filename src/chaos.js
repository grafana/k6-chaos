import { Kubernetes } from 'k6/x/kubernetes';

export class KubernetesClient {
    constructor(config) {
        if (config) {
            this.kubernetes = new Kubernetes(config)
        } else {
            this.kubernetes = new Kubernetes()
        }
    }

    getPodNames(namespace) {
        return this.kubernetes.pods.list(namespace).map(function(pod){
            return pod.name
        })
    }

    getJobNames(namespace) {
        return this.kubernetes.jobs.list(namespace).map(function(job){
            return job.name
        })
    }

    getNodeNames() {
        return this.kubernetes.nodes.list().map(function(node){
            return node.name
        })
    }

    getRandomPod(namespace) {
        const podNames = this.getPodNames(namespace)
        return podNames[Math.floor(Math.random() * podNames.length)]
    }

    getRandomJob(namespace) {
        const jobNames = this.getJobNames(namespace)
        return jobNames[Math.floor(Math.random() * jobNames.length)]
    }

    runJobOnNodes(namespace, jobName, nodes, image, command){
        for (let i = 0; i < nodes.length; i++) {
          let name = `${jobName}-${(Math.random() + 1).toString(36).substring(7)}`;
          console.log(`Creating job ${name} on node ${nodes[i]}`)
          this.kubernetes.jobs.create({
            namespace: namespace,
            name: name,
            image: image,
            command: command,
            node_name: nodes[i]
          })
        }
        return jobName
    }

    cleanJobs(namespace, jobName){
        let jobs = this.getJobNames(namespace)
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].includes(jobName)) {
                console.log(`Deleting job ${jobs[i]}`)
                this.kubernetes.jobs.delete(jobs[i],namespace)
            }
        }
        let pods = this.getPodNames(namespace)
        for (let i = 0; i < pods.length; i++) {
            if (pods[i].includes(jobName)) {
                console.log(`Deleting pod ${pods[i]}`)
                this.kubernetes.pods.delete(pods[i],namespace)
            }
        }
        return jobName
    }

    // Kill a random pod in the specified namespace.
    killRandomPod(namespace) {
        const podName = this.getRandomPod(namespace)
        this.kubernetes.pods.kill(podName,namespace)
        return podName
    }

    // Kill a random job in the specified namespace.
    killRandomJob(namespace) {
        const jobName = this.getRandomJob(namespace)
        this.kubernetes.jobs.kill(jobName,namespace)
        return jobName
    }

    // Delete a random namespace.
    deleteRandomNamespace() {
        const namespaces = this.kubernetes.namespaces.list()
        const randomNamespace = namespaces[Math.floor(Math.random() * namespaces.length)]
        this.kubernetes.namespaces.delete(randomNamespace.name)
        return randomNamespace.name
    }
}

export class StressNodesAttack {
    constructor(client) {
        this.kubernetes = client
        this.name = 'stress-nodes'
        this.namespace = 'default'
        this.cpu = '0'
        this.io = '0'
        this.vm = '0'
        this.vmBytes = '256MB'
        this.timeout = '10'
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
        this.kubernetes.runJobOnNodes(
            this.namespace,
            this.name,
            this.nodes,
            'progrium/stress',
            ['stress', '--cpu', this.cpu, '--io', this.io, '--vm', this.vm, '--vm-bytes', this.vmBytes, '--timeout', this.timeout]
        )
        return this.name
    }
    clean() {
        this.kubernetes.cleanJobs(this.namespace, this.name)
        return this.name
    }
}
