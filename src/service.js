import { PodDisruptor } from './pod.js';

const RANDOM_PICKER = 'random'

export class ServiceDisruptor {
    constructor(client, name, options) {
        this.client = client,
        this.name = name
        this.options = options
        this.wait = options.wait || "30s"
        this.namespace = options.namespace || 'default'
        this.picker = options.picker || RANDOM_PICKER
        this.selector = this._getServiceSelector()
        this.pod_disruptor = this._selectPods()
    }

    _getServiceSelector() {
        const svc = this.client.services.get(this.name, this.namespace)
        return svc.spec.selector
    }

    _selectPods() {
        return new PodDisruptor(
            this.client,
            {
                namespace: this.namespace,
                selector: this.selector,
                picker: this.picker,
                wait: this.wait
            }
        )
    }

    disruptHttp(options){
        this.pod_disruptor.disruptHttp(options)
    }

    killInstance() {
        this.pod_disruptor.kill()
    }
}

