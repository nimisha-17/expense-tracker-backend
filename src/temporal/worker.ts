import { NativeConnection, Worker } from "@temporalio/worker";
import connectDatabase from "../config/database";
import * as activities from "./activities";

async function run(): Promise<void> {
  await connectDatabase();

  const connection = await NativeConnection.connect({
    address: "localhost:7233"
  });

  const worker = await Worker.create({
    connection,
    namespace: "default",
    taskQueue: "expense-tracker-task-queue",
    workflowsPath: require.resolve("./workflows"),
    activities
  });

  console.log("Temporal Worker started.");

  await worker.run();
}

run().catch((error) => {
  console.error("Temporal Worker failed:", error);
  process.exit(1);
});