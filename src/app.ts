import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import validate from "./middlewares/valitade.middleware";

const app = express();

app.use(express.json());
app.use(validate);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use(errorMiddleware);

export default app;