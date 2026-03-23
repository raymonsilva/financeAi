import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import gastosRouter from "./controllers/Gastos";
import userRouter from "./controllers/User";

const app = express();

app.use(express.json());
app.use("/gastos", gastosRouter);
app.use("/user", userRouter);

app.get("/resumo", (req: Request, res: Response) => {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const target = query ? `/gastos/resumo?${query}` : "/gastos/resumo";
  return res.redirect(target);
});

app.get("/resumo/:userId", (req: Request, res: Response) => {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const target = query
    ? `/gastos/resumo/${req.params.userId}?${query}`
    : `/gastos/resumo/${req.params.userId}`;
  return res.redirect(target);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use(errorMiddleware);

export default app;