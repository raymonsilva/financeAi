import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import gastosRouter from "./controllers/Gastos";
import userRouter from "./controllers/User";
import orcamentoRouter from "./controllers/OrcamentoMensal";
import adminRouter from "./controllers/Admin";
import { env } from "./config/env";

const app = express();

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const allowedOriginRules = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:5173"];

const matchesOriginRule = (origin: string, rule: string) => {
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedRule = normalizeOrigin(rule);

  if (!normalizedRule.includes("*")) {
    return normalizedOrigin === normalizedRule;
  }

  const escapedRule = normalizedRule.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const wildcardRegex = new RegExp(`^${escapedRule.replace(/\\\*/g, ".*")}$`);
  return wildcardRegex.test(normalizedOrigin);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOriginRules.some((rule) => matchesOriginRule(origin, rule))) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use("/gastos", gastosRouter);
app.use("/orcamentos", orcamentoRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);

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

app.get("/orcamento", (req: Request, res: Response) => {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const target = query ? `/orcamentos?${query}` : "/orcamentos";
  return res.redirect(target);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use(errorMiddleware);

export default app;