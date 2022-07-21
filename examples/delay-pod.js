import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { PodAttack } from '../src/pod-attack.js';
import { DeploymentHelper } from '../src/helpers.js';
import  http from 'k6/http';

const app = "nginx"
const image = "nginx"

export function setup() {
  const k8sClient = new Kubernetes()

  // create a random namespace
  const namespace = "k6-"+Math.random().toString(32).slice(2, 7);
  k8sClient.namespaces.create({name: namespace})

  // create a test deployment
  const helper = new DeploymentHelper(k8sClient, app, namespace, image, 1)
  helper.deploy()
  
  // give time for deployment's pods to be created
  sleep(5)

  const ip = helper.expose()

  // pass service ip to scenarios
  return {
    srv_ip: ip,
    pods: helper.getPods(),
    namespace: namespace,
  }
}

export function teardown(data) {
  const k8sClient = new Kubernetes()
  k8sClient.namespaces.delete(data.namespace)
}

export function disrupt(data) {
  const k8sClient = new Kubernetes()
  const target = data.pods[0]

  // stress the pod of the cluster
  const podAttack = new PodAttack(
    k8sClient,
    target,
    data.namespace
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
