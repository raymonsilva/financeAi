import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import gastosRouter from "./controllers/Gastos";
import userRouter from "./controllers/User";

const app = express();

app.use(express.json());
app.use("/gastos", gastosRouter);
app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use(errorMiddleware);

export default app;