> ### ⚠️ This is a proof of concept
>
> As this is a proof of concept, the API may break in the future. USE AT YOUR OWN RISK!

# k6-jslib-chaos

Do you want to unleash some chaos? You are in the right place!

This repo contains a [collection of JavaScript helpers](./src/kubernetes.js) to run chaos experiments *effortlessly* on top of [k6](https://k6.io).

# Getting started

The first thing you need is a custom k6 binary with the extensions required to use this library: [xk6-kubernetes](https://github.com/grafana/xk6-kubernetes). 

You can also download the required k6 binary from the [releases page](https://github.com/grafana/k6-jslib-chaos/releases).

# Example

```javascript
import { Kubernetes } from 'k6/x/kubernetes';
import { KillRandomPod, DeleteRandomNamespace } from './src/kubernetes.js';

export default function () {
  // We instantiate a Kubernetes client.
  const kubernetes = new Kubernetes()

  // We run KillRandomPod to randomly kill a pod in the specified namespace.
  const killed = KillRandomPod(kubernetes, 'operations')
  console.log(`Killed pod: ${killed}`);

  // And then, we run DeleteRandomNamespace to delete a random namespace.
  const deleted = DeleteRandomNamespace(kubernetes)
  console.log(`Deleted namespace: ${deleted}`);
}
```

# APIs

| Method | Description |
| -------- | ---- |
| `KillRandomPod` | kill a pod randomly in the specified namespace |
| `KillRandomJob` | kill a job randomly in the specified namespace |
| `DeleteRandomNamespace` | delete a random namespace |

