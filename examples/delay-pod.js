import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { PodAttack } from '../src/pod-attack.js';
import  http from 'k6/http';

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

function serviceManifest(name, app) {
  return `apiVersion: v1
kind: Service
metadata:
  name: ` + name + `
spec:
  selector:
    app: ` + app + `
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      name: http
`
}

function labelMatcher(selector, labels) {
  for (const [label, value] of Object.entries(selector)) {
    if (labels[label] != value) {
      return false
    }
  }
  return true
}

function getDeploymentPods(k8sClient, name, namespace) {
  const deployment = k8sClient.deployments.get(name, namespace)
  let labelSelector = deployment.spec.selector.match_labels
  const pods = k8sClient.pods.list(namespace)
  return pods.filter(pod => { return labelMatcher(labelSelector, pod.labels) })
}

export function setup() {
  const k8sClient = new Kubernetes()

  // create a test deployment
  k8sClient.deployments.apply(deploymentYaml(app, app, 1), namespace)

  // expose as a LoadBalancer service
  let svc = k8sClient.services.apply(serviceManifest(service, app), namespace)
  console.log("Waiting service " + service + " to get an external ip ...")
  sleep(10)
  svc = k8sClient.services.get(service, namespace)
  console.log(svc.status.load_balancer.ingress[0].ip)
  return {
    srv_ip: svc.status.load_balancer.ingress[0].ip
  }
}


export function disrupt() {
  const k8sClient = new Kubernetes()

  const target = getDeploymentPods(k8sClient, app, namespace)[0]

  // stress the pod of the cluster
  const podAttack = new PodAttack(
    k8sClient,
    target.name,
    namespace
  )

  podAttack.startDelayAttack(
    {
      delay: 100,
      duration: "30s"
    }
  )
}

export default function(data) {
  http.get('http://'+ data.srv_ip);
  sleep(1)
}

export const options = {
  scenarios: {
    load: {
      executor: 'constant-vus',
      vus: 10,
      exec: "default",
      startTime: '0s',
      duration: "60s",
    }, 
    delay: {
      executor: 'shared-iterations',
      iterations: 1,
      vus: 1,
      exec: "disrupt",
      startTime: "30s",
    }
  }
}
