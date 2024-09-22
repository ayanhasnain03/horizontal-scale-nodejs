import express from "express";
// Import the Express library for building web servers.

import cluster from "cluster";
// Import the cluster module to create multiple worker processes for load balancing.

import os from "os";
// Import the OS module to get information about the operating system, specifically the number of CPUs.

const totalCPUs = os.cpus().length;
// Get the total number of CPU cores available on the machine.

const port = 3000;
// Define the port number for the server (3000).

if (cluster.isPrimary) {
  // Check if the current process is the primary/master process (not a worker process).

  console.log(`Number of CPUs is ${totalCPUs}`);
  // Log the number of available CPU cores.

  console.log(`Primary ${process.pid} is running`);
  // Log that the primary process is running, and show its process ID (pid).

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
    // Create a new worker process for each CPU core to take advantage of multi-core processing.
  }

  cluster.on("exit", (worker, code, signal) => {
    // Listen for the event when a worker process exits (dies).

    console.log(`worker ${worker.process.pid} died`);
    // Log that a worker process has died and show its process ID.

    console.log("Let's fork another worker!");
    // Log a message saying that the program will create a new worker to replace the one that died.

    cluster.fork();
    // Create a new worker process to keep the system running with the same number of workers.
  });
} else {
  // If the process is not the primary, it's a worker process.

  const app = express();
  // Create an Express application instance.

  console.log(`Worker ${process.pid} started`);
  // Log that the worker process has started, with its process ID.

  app.get("/", (req, res) => {
    // Define a route for the root URL ("/"). When a request is made to this URL:
    res.send("Hello World!");
    // Respond with "Hello World!".
  });

  app.get("/api/:n", function (req, res) {
    // Define a route "/api/:n" that takes a number `n` as a parameter.

    let n = parseInt(req.params.n);
    // Parse the `n` parameter from the request as an integer.

    let count = 0;
    // Initialize a `count` variable to store the sum of numbers from 0 to `n`.

    if (n > 5000000000) n = 5000000000;
    // Limit the value of `n` to 5 billion to avoid overly long computations.

    for (let i = 0; i <= n; i++) {
      // A loop that runs from 0 to `n` and sums up all the numbers.
      count += i;
    }

    res.send(`Final count is ${count} ${process.pid}`);
    // Respond with the final count and the process ID of the worker that handled the request.
  });

  app.listen(port, () => {
    // Start the Express server and make it listen on the specified port.
    console.log(`App listening on port ${port}`);
    // Log that the server is now listening for requests on the specified port.
  });
}
