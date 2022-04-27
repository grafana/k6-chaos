import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaosClient } from '../src/chaos.js';

export default function () {

  // KubernetesChaosClient requires the Kubernetes client from xk6-kubernetes.
  const k8sClient = new Kubernetes()

  // get number of existing pods
  let pods = k8sClient.pods.list(),
      podsLength = pods.length;


  // randomly kill a pod of the given namespace.
  KubernetesChaosClient.killRandomPod(k8sClient, pods[0].namespace);
  sleep(2);

  // validate a pod was killed
  pods = k8sClient.pods.list()
  if(pods.length + 1 === podsLength) {
    console.log("pod was killed")
  } else {
    throw "pod was not killed"
  }
}
