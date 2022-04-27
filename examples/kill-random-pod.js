import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from '../src/kubernetes.js';

export default function () {

  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // get number of existing pods
  let pods = k8sClient.pods.list(),
      podsLength = pods.length;

  console.log(podsLength);

  // randomly kill a pod of the given namespace.
  k8sChaos.killRandomPod(pods[0].namespace);

  console.log(deletedPod);

  sleep(8);
  // validate a pod was killed
  pods = k8sClient.pods.list()

  console.log(pods.length);
  if(pods.length + 1 === podsLength) {
    console.log("pod was killed")
  } else {
    throw "pod was not killed"
  }
}
