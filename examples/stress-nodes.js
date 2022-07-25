import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { NodeDisruptor } from '../src/stress.js';

export default function () {
  const k8sClient = new Kubernetes()
  const nodes = k8sClient.nodes.list().map(node => node.name)
  const nodeDisruptor = new NodeDisruptor(k8sClient)
  
  // stress the nodes of the cluster
  nodeDisruptor.stress(
    nodes,
    {
      cpu_load: 50,
      duration: "30s"
    }
  )
 
  // Here we can run tests while the node is stressed, not for now we just wait.
  sleep(20);
}
