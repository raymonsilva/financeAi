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
        return res.status(200).json({
            message: "Orçamento mensal obtido com sucesso.",
            data: orcamento
        });
    } catch (error) {
        console.error("Erro ao obter orçamento mensal:", error);
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

        const resultado = await orcamentoService.percentualConsumido(userId, mesNumero, anoNumero);
        return res.status(200).json({
            message: "Status do orçamento calculado com sucesso.",
            data: resultado
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("Orçamento mensal não encontrado")) {
            return res.status(404).json({ message: error.message });
        }
        console.error("Erro ao obter status do orçamento mensal:", error);
        return res.status(500).json({ message: "Erro ao obter orçamento mensal." });
    }
});

router.post("/", authMiddleware, validate(orcamentoMensalValidationSchema), async (req, res) => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório." });
        }

        const data = { ...req.body, userId };
        const orcamento = await orcamentoService.criarOrcamento(data);
        return res.status(201).json({
            message: "Orçamento mensal criado com sucesso.",
            data: orcamento
        });
    } catch (error) {
        console.error("Erro ao criar orçamento mensal:", error);
        return res.status(500).json({ message: "Erro ao criar orçamento mensal." });
    }
});

router.put("/:id/limite", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { limite } = req.body;
        const userId = (req as any).userId;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Parâmetro id inválido." });
        }

        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório." });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "id inválido." });
        }

        const orcamento = await orcamentoService.limiteGastos(id, userId, limite);

        if (!orcamento) {
            return res.status(404).json({ message: "Orçamento não encontrado." });
        }

        return res.status(200).json({
            message: "Limite de gastos atualizado com sucesso.",
            data: orcamento
        });
    } catch (error) {
        console.error("Erro ao atualizar limite de gastos:", error);
        return res.status(500).json({ message: "Erro ao atualizar limite de gastos." });
    }
});


export default router;
