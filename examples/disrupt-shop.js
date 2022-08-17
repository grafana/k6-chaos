import { Kubernetes } from 'k6/x/kubernetes';
import { ServiceDisruptor } from '../src/service.js';
import { ServiceHelper } from '../src/helpers.js';
import  http from 'k6/http';

const namespace = "sock-shop"
const products = [
    "a0a4f044-b040-410d-8ead-4de0446aec7e",
    "808a2de1-1aaa-4c25-a9b9-6612e8f29a38",
    "510a0d7e-8e83-4193-b483-e27e09ddc34d",
    "03fef6ac-1896-4ce8-bd69-b798f85c6e0b",
    "d3588630-ad8e-49df-bbd7-3167f7efb246",
    "819e1fbf-8b7e-4f6d-811f-693534916a8b",
    "zzz4f044-b040-410d-8ead-4de0446aec7e",
    "3395a43e-2d88-40de-b95f-e00e1502085b",
    "837ab141-399e-4c1f-9abc-bace40296bac",
]

export function setup() {
    const k8s = new Kubernetes()
    const svcHelper = new ServiceHelper(k8s, 'front-end', namespace)
    const ip = svcHelper.getIp()
    return {
        srv_ip: ip,
    }
}

export function disrupt(data) {
  const k8s = new Kubernetes()

  // delay traffic from one random replica of the deployment
  const svcDisruptor = new ServiceDisruptor(
    k8s,
    "catalogue",
    {
      namespace: namespace,
    }
  )

  svcDisruptor.disruptHttp(
    {
      delay: 10,
      duration: "60s",
      error_code: 500,
      error_rate: 0.1
    }
  )
}

export default function(data) {
    const item = products[Math.floor(Math.random()*products.length)];
    http.get(`http://${data.srv_ip}/catalogue/${item}`);
}

export const options = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: 10,
      preAllocatedVUs: 5,
      maxVUs: 100,
      exec: "default",
      startTime: '0s',
      duration: "60s",
    }, 
    disrupt: {
      executor: 'shared-iterations',
      iterations: 1,
      vus: 1,
      exec: "disrupt",
      startTime: "0s",
    }
  }
}
