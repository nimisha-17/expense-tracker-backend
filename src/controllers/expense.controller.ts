import { Request, Response } from "express";
import Expense from "../models/expense.model";

// CREATE
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create expense.",
      error: error
    });
  }
};

// READ ALL
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expenses = await Expense.find();

    res.json({
      success: true,
      expenses: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses.",
      error: error
    });
  }
};

// READ ONE
export const getExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found."
      });
      return;
    }

    res.json({
      success: true,
      expense: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid expense ID."
    });
  }
};

// UPDATE
export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found."
      });
      return;
    }

    res.json({
      success: true,
      message: "Expense updated successfully.",
      expense: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update expense.",
      error: error
    });
  }
};

// DELETE
export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found."
      });
      return;
    }

    res.json({
      success: true,
      message: "Expense deleted successfully."
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid expense ID."
    });
  }
};