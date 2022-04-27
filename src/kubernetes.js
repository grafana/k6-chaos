
export class KubernetesChaos {

    constructor(client) {
        this.client = client;
    }

    _getPodNames(namespaceName) {
        return this.client.pods.list(namespaceName).map(function(pod){
            return pod.name
        })
    }

    _getJobNames(namespaceName) {
        return this.client.jobs.list(namespaceName).map(function(job){
            return job.name
        })
    }

    // Kill a random pod in the specified namespaceName.
    killRandomPod(namespaceName) {
        const podNames = this._getPodNames(namespaceName)
        const podName = podNames[Math.floor(Math.random() * podNames.length)]
        return this.client.pods.delete(podName,namespaceName)
    }

    // Kill a random job in the specified namespaceName.
    killRandomJob(namespaceName) {
        const jobNames = this._getJobNames(namespaceName)
        const jobName = jobNames[Math.floor(Math.random() * jobNames.length)]
        return this.client.jobs.delete(jobName,namespaceName)
    }

    // Kill a namespaceName.
    killNamespace(namespaceName) {
        return this.client.namespaces.delete(namespaceName)
    }
}