import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { StressNodesAttack } from '../src/stress.js';

export default function () {
  const k8sClient = new Kubernetes()
  const stress = new StressNodesAttack(k8sClient);
  const nodeNames = k8sClient.nodes.list().map(node => node.name)

  // stress the nodes of the cluster
  stress
    .withCpuLoad("100")
    .withDuration("30s")
    .inNodes(nodeNames)
    .start();

  // Here we can run tests while the node is stressed, not for now we just wait.
  sleep(20);

}
