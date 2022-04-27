import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaosClient } from '../src/chaos.js';

function getNamespaceYaml(name) {
    return `kind: Namespace
apiVersion: v1
metadata:
  name: ` + name + `
  labels:
    name: ` + name + `
`;
}

export default function () {

  // KubernetesChaosClient requires the Kubernetes client from xk6-kubernetes.
  const k8sClient = new Kubernetes({})

  // create a namespace
  const namespaceName = "namespace-name";
  k8sClient.namespaces.apply(getNamespaceYaml(namespaceName));

  // get number of existing namespaces
  let nss = k8sClient.namespaces.list(),
      nssLength = nss.length;

  // kill the namespace.
  KubernetesChaosClient.killNamespace(k8sClient, namespaceName)


  // validate the namespace was killed
  sleep(10); // we should check the namespace does not exist or is terminating
  nss = k8sClient.namespaces.list()
  if(nss.length + 1 === nssLength) {
    console.log("namespace was killed")
  } else {
    throw "namespace was not killed"
  }
}
