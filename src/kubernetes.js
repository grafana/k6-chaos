
export class KubernetesChaos {

    constructor(client, namespace = 'default') {
        this.client = client;
        this.namespace = namespace
    }

    _getPodNames() {
        return this.client.pods.list(this.namespace).map(pod=> pod.name)
    }

    _getJobNames() {
        return this.client.jobs.list(this.namespace).map(job => job.name)
    }

    // Kill a random pod in the specified namespaceName.
    killRandomPod() {
        const podNames = this._getPodNames()
        const podName = podNames[Math.floor(Math.random() * podNames.length)]
        return this.client.pods.delete(podName, this.namespace)
    }

    // Kill a random job in the specified namespaceName.
    killRandomJob() {
        const jobNames = this._getJobNames()
        const jobName = jobNames[Math.floor(Math.random() * jobNames.length)]
        return this.client.jobs.delete(jobName, this.namespace)
    }

    // Kill a namespaceName.
    killNamespace() {
        return this.client.namespaces.delete(this.namespace)
    }
}
