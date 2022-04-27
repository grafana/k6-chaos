
export class KubernetesChaosClient {

    static _getPodNames(kubernetes, nameSpace) {
        return kubernetes.pods.list(nameSpace).map(function(pod){
            return pod.name
        })
    }

    static _getJobNames(kubernetes, nameSpace) {
        return kubernetes.jobs.list(nameSpace).map(function(job){
            return job.name
        })
    }

    // Kill a random pod in the specified namespace.
    static killRandomPod(kubernetes, nameSpace) {
        const podNames = this._getPodNames(kubernetes, nameSpace)
        const podName = podNames[Math.floor(Math.random() * podNames.length)]
        kubernetes.pods.delete(podName,nameSpace)
        return podName
    }

    // Kill a random job in the specified namespace.
    static killRandomJob(kubernetes, nameSpace) {
        const jobNames = this._getJobNames(kubernetes, nameSpace)
        const jobName = jobNames[Math.floor(Math.random() * jobNames.length)]
        kubernetes.jobs.delete(jobName,nameSpace)
        return jobName
    }

    // Kill a namespace.
    static killNamespace(kubernetes, namespaceName) {
        kubernetes.namespaces.delete(namespaceName)
        return namespaceName
    }
}