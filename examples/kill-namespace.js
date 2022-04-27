import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from '../src/kubernetes.js';

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

  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // create a random namespace
  const namespaceName = Math.random().toString(36).slice(2, 7);
  k8sClient.namespaces.apply(getNamespaceYaml(namespaceName));

  // get number of existing namespaces
  let nss = k8sClient.namespaces.list(),
      nssLength = nss.length;

  // kill the namespace
  k8sChaos.killNamespace(namespaceName)

  // validate the namespace was killed
  sleep(10); // we should check the namespace does not exist or is terminating
  nss = k8sClient.namespaces.list()
  if(nss.length + 1 === nssLength) {
    console.log("namespace was killed")
  } else {
    throw "namespace was not killed"
  }
}
