import { Kubernetes } from 'k6/x/kubernetes';

export class KubernetesClient {
    constructor(config) {
        if (config) {
            this.kubernetes = new Kubernetes(config)
        } else {
            this.kubernetes = new Kubernetes()
        }
    }

    getPodNames(nameSpace) {
        return this.kubernetes.pods.list(nameSpace).map(function(pod){
            return pod.name
        })
    }

    getJobNames(nameSpace) {
        return this.kubernetes.jobs.list(nameSpace).map(function(job){
            return job.name
        })
    }

    getRandomPod(nameSpace) {
        const podNames = this.getPodNames(nameSpace)
        return podNames[Math.floor(Math.random() * podNames.length)]
    }

    getRandomJob(nameSpace) {
        const jobNames = this.getJobNames(nameSpace)
        return jobNames[Math.floor(Math.random() * jobNames.length)]
    }

    // Kill a random pod in the specified namespace.
    killRandomPod(nameSpace) {
        const podName = this.getRandomPod(nameSpace)
        this.kubernetes.pods.kill(podName,nameSpace)
        return podName
    }

    // Kill a random job in the specified namespace.
    killRandomJob(nameSpace) {
        const jobName = this.getRandomJob(nameSpace)
        this.kubernetes.jobs.kill(jobName,nameSpace)
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