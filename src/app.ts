import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import gastosRouter from "./controllers/Gastos";
import userRouter from "./controllers/User";
import orcamentoRouter from "./controllers/OrcamentoMensal";
import adminRouter from "./controllers/Admin";
import { setupSwagger } from "./docs/swagger";
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

  const wildcardRegexText = normalizedRule
    .split("*")
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");

  const wildcardRegex = new RegExp(`^${wildcardRegexText}$`);
  return wildcardRegex.test(normalizedOrigin);
};

const isOriginAllowed = (origin?: string) => {
  if (!origin) {
    return true;
  }

  return allowedOriginRules.some((rule) => matchesOriginRule(origin, rule));
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (typeof origin === "string" && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (req.method === "OPTIONS") {
    if (typeof origin === "string" && !isOriginAllowed(origin)) {
      return res.status(403).json({ message: "Origin not allowed by CORS" });
    }
    return res.sendStatus(204);
  }

  return next();
});

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
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
setupSwagger(app);
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