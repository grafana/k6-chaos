import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from '../src/kubernetes.js';


export default function () {
  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // create a random namespace
  const namespaceName = Math.random().toString(36).slice(2, 7);
  k8sClient.namespaces.create({name: namespaceName});

  // get number of existing namespaces
  let nssLength = k8sClient.namespaces.list().length;

  // kill the namespace
  k8sChaos.killNamespace(namespaceName)

  // validate the namespace was killed
  sleep(10); // we should check the namespace does not exist or is terminating
  if(k8sClient.namespaces.list().length + 1 === nssLength) {
    console.log("namespace was killed")
  } else {
    throw "namespace was not killed"
  }
}
