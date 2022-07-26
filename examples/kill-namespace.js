import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesDisruptor } from '../src/kubernetes.js';

export default function () {
  const k8sClient = new Kubernetes()

    // create a random namespace
    const namespaceName = Math.random().toString(32).slice(2, 7);
    k8sClient.namespaces.create({name: namespaceName});
    sleep(2);

    const K8sDisruptor = new KubernetesDisruptor(k8sClient, namespaceName)

  // kill the namespace
  K8sDisruptor.killNamespace()
  sleep(2);

  // validate the namespace was killed
  for (const ns in k8sClient.namespaces.list()) {
     if (ns.name == namespaceName && ns.status.phase != "Terminating") {
      throw "namespace was not killed"
     }
  }

  console.log("namespace was killed")
}
