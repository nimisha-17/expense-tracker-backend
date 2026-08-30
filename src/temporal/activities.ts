import Expense from "../models/expense.model";
import type { CreateExpenseInput } from "./types";

export async function createExpenseActivity(
  input: CreateExpenseInput
) {
  const expense = await Expense.create(input);

  return expense;
}

export async function notificationActivity(
  message: string
): Promise<string> {
  console.log(`Notification: ${message}`);

  return "Notification processed successfully.";
}