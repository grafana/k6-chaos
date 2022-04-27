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
import { KubernetesChaosClient } from '../src/chaos.js';

export default function () {

  const k8sClient = new Kubernetes()

  // randomly kill a job of the given namespace.
  KubernetesChaosClient.killRandomJob(k8sClient, jobs[0].namespace);
}
```


# APIs

## Kubernetes

| Method | Description |
| -------- | ---- |
| `killNamespace` | kill a namespace |
| `killRandomJob` | kill a job randomly in the specified namespace |
| `killRandomPod` | kill a job randomly in the specified namespace |


## WIP

| Method | Description |
| -------- | ---- |
| `exhaustCPU` | stress CPU in one pod |
| `exhaustMemory` | stress memory in one pod |

