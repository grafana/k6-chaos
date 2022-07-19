import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from '../src/kubernetes.js';


const namespace = "default"
const app = "nginx"
const service = "nginx"

function deploymentYaml(name, app, replicas) {
  return `kind: Deployment
apiVersion: apps/v1
metadata:
  name: ` + name + `
spec:
  replicas: ` + replicas + `
  selector:
    matchLabels:
      app: ` + app + `
  template:
    metadata:
      labels:
        app: ` + app + `
    spec:
      containers:
        - name: nginx
          image: nginx:1.14.2
          ports:
            - containerPort: 80
`
}


export default function () {
  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // create a test deployment
  k8sClient.deployments.apply(deploymentYaml(app, app, 3), namespace)
  sleep(5)

  // randomly kill a pod of the given namespace.
  k8sChaos.killRandomPod();
}
