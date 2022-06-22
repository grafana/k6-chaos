
export class JobRunner {

    constructor(client) {
        this.client = client
    }

   runJobOnNodes(namespace, jobName, nodes, image, command, autodelete){
        let jobs = []
	for (let i = 0; i < nodes.length; i++) {
          let name = `${jobName}-${(Math.random() + 1).toString(36).substring(7)}`;
          console.log(`Creating job ${name} on node ${nodes[i]}`)
          const job = this.client.jobs.create({
            namespace: namespace,
            name: name,
            image: image,
	    pull_policy: "IfNotPresent",
            command: command,
            node_name: nodes[i],
            autodelete: autodelete
          })
	  jobs.push(name)
        }
        return jobs
    }

    cleanJobs(namespace, jobs){
        for (let i = 0; i < jobs.length; i++) {
           console.log(`Deleting job ${jobs[i]}`)
           this.client.jobs.delete(jobs[i],namespace)
        }
        return jobs
    }

}
