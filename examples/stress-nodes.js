import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { NodeDisruptor } from '../src/node.js';

export default function () {
  const k8sClient = new Kubernetes()
  const nodeDisruptor = new NodeDisruptor(
    k8sClient,
    {
      name: 'k6-chaos',
      selector: {},
      picker: 'random'
    }
  )
  
  // stress the nodes of the cluster
  nodeDisruptor.stress(
    {
      cpu_load: 50,
      duration: "30s"
    }
  )
 
  // Here we can run tests while the node is stressed, not for now we just wait.
  sleep(20);
}
