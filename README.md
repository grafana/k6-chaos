> ### ⚠️ This is a proof of concept
>
> As this is a proof of concept, the API may break in the future. USE AT YOUR OWN RISK!

# k6-chaos

Do you want to unleash some chaos? You are in the right place!

This repo contains a [collection of JavaScript helpers](./src/chaos.js) to run chaos experiments *effortlessly* on top of [k6](https://k6.io).

# Getting started

The first thing you need is a custom k6 binary with the extensions required to use this library: [xk6-kubernetes](https://github.com/grafana/xk6-kubernetes). 

You can also download the required k6 binary from the [releases page](https://github.com/grafana/k6-jslib-chaos/releases).

# APIs

## Helpers

The `helpers.js` module offers helper functions and clases to facilitate the setup of test scenariors

### DeploymentHelper

The `DeploymentHelper` class facilitates deploying applications and exposing them as services.

Methods

`constructor` creates a helper for deploying an application

      Parameters:
        client: k8s client from xk6-kubernetes
        name: name of the application
        image: image of the application
        replicas: number of replicas
        options:
          - namespace: target namespace (default is the 'default' namespace)
          - app: value of the 'app' label used as pod selector. Defaults to the name
          - port: port to expose in the application's container. Defaults to '80' 

`deploy` deploys the application

`expose` exposes the application as a service

      Parameters
        options: additional parameters for configuring the service
          - port: port to expose the service. Defaults to '80'
          - name: servie name. Defaults to the application's name

`getPods` returns a list with the names of the deployment pods

## KubernetesChaos

The `KubernetesChaos` class offers methods for introducing faults in kubernetes resources (pods, jobs, etcetera)

Methods

`constructor`: creates an instance of KubernetesChaos

      Parameters
        client: k8s client from xk6-kubernetes

`killNamespace`: kill a namespace

`killRandomJob`: kill a job randomly in a namespace

`killRandomPod`: kill a job randomly in a namespace


### Example

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

## Pod Disruption


The `PodAttack` class allows disruption a Pod

Methods:

`constructor`: creates an attack for a pod

    Parameters:
      client: k8s client from xk6-kubernetes
      pod: name
      namespace:
      options: options

`startDelayAttack`: 

    Parameters:
      options: controls the delay attack
        - delay: average delay in network packages (in milliseconds)
        - variation: variation in the delay (in milliseconds)
        - duration: duration of the disruption 
