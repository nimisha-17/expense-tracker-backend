import express from "express";
import connectDatabase from "./config/database";
import expenseRoutes from "./routes/expense.routes";

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

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();