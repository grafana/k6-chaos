import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaosClient } from '../src/chaos.js';

export default function () {

  // KubernetesChaosClient requires the Kubernetes client from xk6-kubernetes.
  const k8sClient = new Kubernetes()

  // get number of existing jobs
  let jobs = k8sClient.jobs.list(),
      jobsLength = jobs.length;


  // randomly kill a job of the given namespace.
  KubernetesChaosClient.killRandomJob(k8sClient, jobs[0].namespace);
  sleep(2);

  // validate a job was killed
  jobs = k8sClient.jobs.list();
  if(jobs.length + 1 === jobsLength) {
    console.log("job was killed")
  } else {
    throw "job was not killed"
  }
}
