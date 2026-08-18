import mongoose, { Document, Model } from "mongoose";

export interface ExpenseDocument extends Document {
  title: string;
  amount: number;
  category: string;
  date: string;
}

const expenseSchema = new mongoose.Schema<ExpenseDocument>(
  {
    title: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    date: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Expense: Model<ExpenseDocument> =
  mongoose.model<ExpenseDocument>("Expense", expenseSchema);

export default Expense;