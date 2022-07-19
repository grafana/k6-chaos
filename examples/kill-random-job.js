import { sleep } from 'k6';
import { Kubernetes } from 'k6/x/kubernetes';
import { KubernetesChaos } from '../src/kubernetes.js';

export default function () {

  // KubernetesChaosClient requires the Kubernetes client from xk6-kubernetes.
  const k8sClient = new Kubernetes()
  const k8sChaos = new KubernetesChaos(k8sClient)

  // create random job
  k8sClient.jobs.create({
    namespace: 'default',
    name: Math.random().toString(36).slice(2, 7),
    image: "perl",
    command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
  })
  sleep(1)

  // get number of existing jobs
  let jobs = k8sClient.jobs.list(),
      jobsLength = jobs.length;

  console.log(jobsLength)

  // randomly kill a job of the given namespace.
  k8sChaos.killRandomJob();
  sleep(2);


  // validate a job was killed
  jobs = k8sClient.jobs.list();
  if(jobs.length + 1 === jobsLength) {
    console.log("job was killed")
  } else {
    throw "job was not killed"
  }
}
