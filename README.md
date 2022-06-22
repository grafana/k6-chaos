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


## Node stress
The `StressNodeAttack` class allows stressing a list of nodes. 

| Method | Description |
| -------- | ---- |
| `inNamespace` | start stress load in the given namespace  |
| `inNodes` | stress the given nodes |
| `noAutocleanup | do not delete stress jobs automatically when the attack ends |
| `withCores` | sets the number of CPU concurrent stress processes to start |
| `withCpuLoad` | sets the CPU load per stress process |
| `withDuration` | sets the duration of the stress attack. E.g. '5m' |
| `withName` | name of the attack. Used as prefix for stress jobs |

## Pod disruption
The `PodAttack` class allows the execution of disruptive actions on a running pod. Each attack is started by a `startXXXXAttack` method. Multiples attacks can be started on a pod.

| Method | Description |
| -------- | ---- |
| `inPod` | stress the given pod |
| `inNamespace` | namespace on which the pod is executing  |
| `withName` | name of the attack  |
| `install`  | install the k6-chaos agent in the target pod |
| `startDelayAttack` | starts a network delay attack |

### Network Delay attack

A `PodDelayAttack` is created from a `PodAttack` using the `startDelayArrack` method. This
attack has the following methods:

| Method | Description |
| -------- | ---- |
| `withName` | name of the attack |
| `withDuration` | sets the duration of the stress attack. E.g. '5m' |
| `withDelay` | sets the average network delay introduced in the pod's traffic |
| `withVariation` | sets the variation in the network delay introduced in the pod's traffic following a normal distribution. 0 means a fixed delay |
| `execute` | executes the attack |


