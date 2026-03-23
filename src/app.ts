import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import gastosRouter from "./controllers/Gastos";

const app = express();

app.use(express.json());
app.use("/gastos", gastosRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use(errorMiddleware);

export default app;