import { Kubernetes } from 'k6/x/kubernetes';
import { KillRandomPod, DeleteRandomNamespace } from './src/kubernetes.js';

export default function () {
  // We instantiate a Kubernetes client.
  const kubernetes = new Kubernetes()

  // We run KillRandomPod to randomly kill a pod in the specified namespace.
  const killed = KillRandomPod(kubernetes, 'operations')
  console.log(`Killed pod: ${killed}`);

  // And then, we run DeleteRandomNamespace to delete a random namespace.
  const deleted = DeleteRandomNamespace(kubernetes)
  console.log(`Deleted namespace: ${deleted}`);
}
