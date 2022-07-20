
import { getDeploymentPods } from "./helpers.js";

export class KubernetesChaos {

    constructor(client, namespace = 'default') {
        this.client = client;
        this.namespace = namespace
    }

    // Kill a namespaceName.
    killNamespace() {
        return this.client.namespaces.delete(this.namespace)
    }
}
