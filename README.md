# k6-jslib-chaos

A collection of JavaScript helpers to run chaos experiments *effortlessly* on top of [k6](https://k6.io).

# Getting started

Do you want to unleash some chaos? You are in the right place!

The first thing you need is a custom k6 binary that has all the extensions required to run chaos experiments baked in. You can download a ready-to-use binary from the releases page.

> Why do I need a custom k6 binary? These helpers make heavy use of [k6 extensions](https://k6.io/docs/extensions) to inject failures in your favorite Kubernetes cluster (w/ xk6-kubernetes), or on that EC2 instance that your database runs on (w/ xk6-ssh).

TODO: More explanations, docs, and a few examples
