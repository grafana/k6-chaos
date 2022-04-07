function getPodNames(nameSpace, kubernetes) {
    return kubernetes.pods.list(nameSpace).map(function(pod){
      return pod.name
    })
  }

function getJobNames(nameSpace, kubernetes) {
return kubernetes.jobs.list(nameSpace).map(function(job){
    return job.name
})
}

// KillRandomPod is a function that will randomly kill a pod in the specified namespace.
export function KillRandomPod(kubernetes, namespace) {
    const podNames = getPodNames(namespace, kubernetes)
    const randomPod = podNames[Math.floor(Math.random() * podNames.length)]
    kubernetes.pods.kill(randomPod, namespace)
    return randomPod
}

// KillRandomJob is a function that will randomly kill a job in the specified namespace.
export function KillRandomJob(kubernetes, namespace) {
    const jobNames = getJobNames(namespace, kubernetes)
    const randomJob = jobNames[Math.floor(Math.random() * jobNames.length)]
    kubernetes.jobs.kill(randomJob, namespace)
    return randomJob
}

// DeleteRandomNamespace is a function that will randomly delete a namespace.
export function DeleteRandomNamespace(kubernetes) {
    const namespaces = kubernetes.namespaces.list()
    const randomNamespace = namespaces[Math.floor(Math.random() * namespaces.length)]
    kubernetes.namespaces.delete(randomNamespace.name)
    return randomNamespace.name
}