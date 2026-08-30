import express from "express";
import connectDatabase from "./config/database";
import expenseRoutes from "./routes/expense.routes";
import { getTemporalClient } from "./temporal/client";
import type { CreateExpenseInput } from "./temporal/types";

const app = express();

app.use(express.json());

const PORT = 4000;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running."
  });
});

app.use("/expenses", expenseRoutes);

// Create expense through Temporal Workflow
app.post("/expenses/workflow", async (req, res) => {
  try {
    const input: CreateExpenseInput = req.body;

    const client = await getTemporalClient();

    const workflowId = `create-expense-${Date.now()}`;

    const result = await client.workflow.execute(
      "createExpenseWorkflow",
      {
        taskQueue: "expense-tracker-task-queue",
        workflowId,
        args: [input]
      }
    );

    res.status(201).json({
      success: true,
      message: "Expense created through Temporal Workflow.",
      workflowId,
      expense: result
    });
  } catch (error) {
    console.error("Workflow error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create expense through Temporal Workflow."
    });
  }
});

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();