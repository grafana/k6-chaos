import { sleep } from 'k6';

export class DeploymentHelper {

    constructor(k8sClient, name, image, replicas, options = {}) {
        this.k8sClient = k8sClient
        this.name = name
        this.image = image
        this.replicas = replicas
        this.app = options.app || name
        this.namespace = options.namespace || "default"
        this.port = options.port || 80
    }

    deploymentManifest() {
        return `kind: Deployment
apiVersion: apps/v1
metadata:
  name: ` + this.name + `
spec:
    replicas: ` + this.replicas + `
    selector:
      matchLabels:
        app: ` + this.app + `
    template:
      metadata:
        labels:
          app: ` + this.app + `
      spec:
        containers:
        - name: ` + this.name + `
          image: ` + this.image + `
          ports:
          - containerPort: ` + this.port + `
`
    }

    serviceManifest(name, port) {
        return `apiVersion: v1
kind: Service
metadata:
    name: ` + name + `
spec:
    selector:
       app: ` + this.app + `
    type: LoadBalancer
    ports:
    - protocol: TCP
      port: ` + port + `
      targetPort: ` + this.port + `
      name: http
`  
    }

    deploy() {
        this.k8sClient.deployments.apply(this.deploymentManifest(), this.namespace)
    }

    // exports a deployment as a LoadBalancer service and returns the external IP  
    expose(options = {}) {
        const port = options.port || 80
        const name = options.service || this.name
        const manifest = this.serviceManifest(
            name,
            port,
        )
        // expose as a LoadBalancer service
        let svc = this.k8sClient.services.apply(manifest, this.namespace)
        console.log("Waiting service " + name + " to get an external ip ...")
        while (svc.status.load_balancer.ingress.length == 0) {
            sleep(1)
            svc = this.k8sClient.services.get(name, this.namespace)
        }
        return svc.status.load_balancer.ingress[0].ip 
    }
  
    getPods() {
        return getDeploymentPods(this.k8sClient, this.app, this.namespace).map(pod => pod.name)
    }
}

function labelMatcher(selector, labels) {
    for (const [label, value] of Object.entries(selector)) {
        if (labels[label] != value) {
            return false
        }
    }
    return true
}

export function getDeploymentPods(k8sClient, app, namespace) {
    const deployment = k8sClient.deployments.get(app, namespace)
    let labelSelector = deployment.spec.selector.match_labels
    return k8sClient.pods.list(namespace).filter(pod => { return labelMatcher(labelSelector, pod.labels) })
}
