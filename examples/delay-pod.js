import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { PodAttack } from '../src/pod-attack.js';

export default function () {
  const k8sClient = new Kubernetes()
  const podAttack = new PodAttack(k8sClient);

  // create a test pod
   k8sClient.pods.create({
     namespace: "default",
     name: "nginx",
     image: "nginx",
  })

  // stress the pod of the cluster
  podAttack
    .inPod("nginx")
    .install()
    .startDelayAttack()
    .withDelay(100)
    .withDuration("20s")
    .execute()

  // Here we can run tests while pod's traffic is delayed, not for now we just wait.
  sleep(20);

}
