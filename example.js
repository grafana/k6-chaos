import { KubernetesClient } from './src/chaos.js';

export default function () {
  // We instantiate a new *chaotic* Kubernetes client.
  const kubernetes = new KubernetesClient()

  // We run KillRandomPod to randomly kill a pod in the specified namespace.
  const killed = kubernetes.killRandomPod('operations')
  console.log(`Killed pod: ${killed}`);

  // And then, we run DeleteRandomNamespace to delete a random namespace.
  const deleted = kubernetes.deleteRandomNamespace(kubernetes)
  console.log(`Deleted namespace: ${deleted}`);
}
