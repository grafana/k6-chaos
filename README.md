> ### ⚠️ This is a proof of concept
>
> As this is a proof of concept, the API may break in the future. USE AT YOUR OWN RISK!

# k6-chaos

Do you want to unleash some chaos? You are in the right place!

This repo contains a [collection of JavaScript helpers](./src/chaos.js) to run chaos experiments *effortlessly* on top of [k6](https://k6.io).

# Getting started

The first thing you need is a custom k6 binary with the extensions required to use this library: [xk6-kubernetes](https://github.com/grafana/xk6-kubernetes). 

You can also download the required k6 binary from the [releases page](https://github.com/grafana/k6-jslib-chaos/releases).

# Example

```javascript
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from './src/kubernetes.js';

export default function () {

  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // randomly kill a job of the given namespace.
  k8sChaos.killRandomJob(k8sClient.jobs.list()[0].namespace);
}
```

# APIs

## Kubernetes

| Method | Description |
| -------- | ---- |
| `killNamespace` | kill a namespace |
| `killRandomJob` | kill a job randomly in the specified namespace |
| `killRandomPod` | kill a job randomly in the specified namespace |

## Stress

### Node resource stress

The `StressNodeAttack` class allows stressing a list of nodes.

Methods:

`constructor`: creates a node stress attack

    Parameters:
     client: k8s client from xk6-kubernetes
     options: options
        - name: name of the attack (used as stress job name prefix)
        - namespace: namespace where stress jobs will be started
        - auto_clean: automatically delete stress jobs when attacks ends (defaults to true)

`startAttack`: starts an attack on a list of nodes

    Parameters:
      nodes: list of nodes to stress
      options: controls the stress attack
        - cores: sets the number of CPU concurrent stress processes to start
        - cpu_Load: sets the CPU load per stress process
        - duration: sets the duration of the stress attack. E.g. '5m'

`clean`: clean jobs started by the attack (if auto_cleanup was set to false)