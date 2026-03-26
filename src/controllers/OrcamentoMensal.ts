import express  from "express";
import mongoose from "mongoose";
import validate from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { orcamentoMensalValidationSchema, OrcamentoMensalModel } from "../Schemes/OrçamentoMensalSchema";
import { OrcamentoService } from "../services/orcamento.service";


const orcamentoService = new OrcamentoService();
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { mes, ano } = req.query;
        const userId = (req as any).userId;
        const mesNumero = mes ? Number(mes) : new Date().getMonth() + 1;
        const anoNumero = ano ? Number(ano) : new Date().getFullYear(); 

        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório." });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
        }
        if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
            return res.status(400).json({ message: "Mês inválido. Use valores de 1 a 12." });
        }
        if (!Number.isInteger(anoNumero) || anoNumero < 1900) {
            return res.status(400).json({ message: "Ano inválido." });
        }

        const orcamento = await OrcamentoMensalModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            mes: mesNumero,
            ano: anoNumero
        });
        if (!orcamento) {
            return res.status(404).json({ message: "Orçamento mensal não encontrado para o mês e ano especificados." });
        }
        return res.json(orcamento);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter orçamento mensal." });
    }
});

// Alias para compatibilidade com clientes antigos
router.get("/orcamentos", authMiddleware, async (req, res) => {
    try {
        const { mes, ano } = req.query;
        const userId = (req as any).userId;
        const mesNumero = mes ? Number(mes) : new Date().getMonth() + 1;
        const anoNumero = ano ? Number(ano) : new Date().getFullYear(); 

        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório." });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
        }
        if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
            return res.status(400).json({ message: "Mês inválido. Use valores de 1 a 12." });
        }
        if (!Number.isInteger(anoNumero) || anoNumero < 1900) {
            return res.status(400).json({ message: "Ano inválido." });
        }

        const orcamento = await OrcamentoMensalModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            mes: mesNumero,
            ano: anoNumero
        });
        if (!orcamento) {
            return res.status(404).json({ message: "Orçamento mensal não encontrado para o mês e ano especificados." });
        }
        return res.json(orcamento);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter orçamento mensal." });
    }
});

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const { mes, ano } = req.query;
        const userId = (req as any).userId;
        const mesNumero = mes ? Number(mes) : new Date().getMonth() + 1;
        const anoNumero = ano ? Number(ano) : new Date().getFullYear();

        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório." });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
        }
        if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
            return res.status(400).json({ message: "Mês inválido. Use valores de 1 a 12." });
        }
        if (!Number.isInteger(anoNumero) || anoNumero < 1900) {
            return res.status(400).json({ message: "Ano inválido." });
        }

        const orcamento = await OrcamentoMensalModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            mes: mesNumero,
            ano: anoNumero
        });
        if (!orcamento) {
            return res.status(404).json({ message: "Orçamento mensal não encontrado para o mês e ano especificados." });
        }
        return res.json(orcamento);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter orçamento mensal." });
    }
});

router.post("/", authMiddleware, validate(orcamentoMensalValidationSchema), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const data = { ...req.body, userId };
        const orcamento = await orcamentoService.criarOrcamento(data);
        return res.status(201).json(orcamento);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar orçamento mensal." });
    }
});

// Alias para compatibilidade com clientes antigos
router.post("/or", authMiddleware, validate(orcamentoMensalValidationSchema), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const data = { ...req.body, userId };
        const orcamento = await orcamentoService.criarOrcamento(data);
        return res.status(201).json(orcamento);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar orçamento mensal." });
    }
});


export default router;
