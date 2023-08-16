/**
 *  CLUSTER
 *  
 * ----------------
 * Intruduction
 * ----------------
 * Node.js, by default, follows the single threaded event loop based architecture.
 * Even if the computer has more than one CPU core, Node.js does not use all of them by default. 
 * It only uses one CPU core for the main thread that handles the event loop.
 * Node.js comes bundled up with a cluster module. Clustering is a great way to optimize your Node.js app’s overall performance.
 * The cluster module permits the creation of child processes, that are copies of your app concurrently on the same server port.
 * 
 * ----------------
 * Use for 
 * ----------------
 * 1. Scalability - The application must be updated so as to support a large number of users and provide a good experience to all of them. 
 *                  Clustering acts as a load-balancing and parallel processing service.
 * 2. performance - Load is shared among the multiple cores of the application.
 * 
 */

const express = require("express");
const port = 3000;
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  console.log(`Worker ${process.pid} started`);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/api/:n", function (req, res) {
    console.log(`Worker ${process.pid} started`);
    let n = parseInt(req.params.n);
    let count = 0;

    if (n > 5000000000) n = 5000000000;

    for (let i = 0; i <= n; i++) {
      count += i;
    }

    res.send(`Final count is ${count}`);
  });


  app.get("/apis/:n", function (req, res) {
    console.log(`Worker ${process.pid} started`);
    let n = parseInt(req.params.n);
    let count = 0;

    if (n > 5000000000) n = 5000000000;

    for (let i = 0; i <= n; i++) {
      count += i;
    }

    res.send(`Final count is ${count}`);
  });
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}