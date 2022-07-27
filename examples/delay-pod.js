import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { PodDisruptor } from '../src/pod.js';
import { DeploymentHelper } from '../src/helpers.js';
import  http from 'k6/http';

const app = "httpbin"
const image = "kennethreitz/httpbin"

export function setup() {
  const k8sClient = new Kubernetes()

  // create a random namespace
  const namespace = "k6-"+Math.random().toString(32).slice(2, 7);
  k8sClient.namespaces.create({name: namespace})

  // create a test deployment
  const helper = new DeploymentHelper(k8sClient, app, namespace, image, 2)
  helper.deploy()
  
  const ip = helper.expose()

  // pass service ip to scenarios
  return {
    srv_ip: ip,
    namespace: namespace,
  }
}

export function teardown(data) {
  const k8sClient = new Kubernetes()
  k8sClient.namespaces.delete(data.namespace)
}

export function disrupt(data) {
  const k8sClient = new Kubernetes()

  // delay traffic from one random replica of the deployment
  const podDisruptor = new PodDisruptor(
    k8sClient,
    {
      namespace: data.namespace,
      selector: { app: app},
      picker: 'random'
    }
  )

  podDisruptor.slowdownNetwork(
    {
      delay: 200,
      duration: "30s"
    }
  )
}

export default function(data) {
  http.get(`http://${data.srv_ip}/delay/0.1`);
}

export const options = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: 100,
      preAllocatedVUs: 10,
      maxVUs: 100,
      exec: "default",
      startTime: '0s',
      duration: "90s",
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
