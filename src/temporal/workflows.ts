import {
  proxyActivities,
  startChild
} from "@temporalio/workflow";
import type { CreateExpenseInput } from "./types";

const activities = proxyActivities<{
  createExpenseActivity(
    input: CreateExpenseInput
  ): Promise<unknown>;

  notificationActivity(
    message: string
  ): Promise<string>;
}>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3
  }
});

export async function createExpenseWorkflow(
  input: CreateExpenseInput
) {
  const expense = await activities.createExpenseActivity(input);

  const childWorkflow = await startChild(notificationWorkflow, {
    args: [`Expense "${input.title}" was created.`]
  });

  const notificationResult = await childWorkflow.result();

  return {
    expense,
    notificationResult
  };
}

export async function notificationWorkflow(
  message: string
): Promise<string> {
  return await activities.notificationActivity(message);
}