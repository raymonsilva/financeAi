import express from 'express';
import mongoose from 'mongoose';
import validate from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gastosValidationSchema, gastosUpdateValidationSchema, GastosModel } from '../Schemes/GastosSchema';
import { GastosService } from '../services/gastos.service';
import { UserModel } from '../Schemes/UserSchema';

const gastosService = new GastosService();
const router = express.Router();

const handleResumo = async (req: express.Request, res: express.Response, userId: string) => {
    try {
        const { mes, ano } = req.query;
        const now = new Date();
        const mesNumero = mes ? Number(mes) : now.getMonth() + 1;
        const anoNumero = ano ? Number(ano) : now.getFullYear();

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

        const totalGastos = await gastosService.calcularTotalMes(
            userId,
            mesNumero,
            anoNumero
        );

        const usuario = await UserModel.findById(userId);

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const saldo = usuario.salario - totalGastos;

        const status = saldo >= 0 ? "Dentro do orçamento" : "Excedido o orçamento";

        return res.json({
            nome: usuario.nome,
            salario: usuario.salario,
            gastos: totalGastos,
            saldo,
            status
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao calcular resumo." });
    }
};

// Rota para obter os gastos
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
        }

        const gastos = await GastosModel.find({ userId }).sort({ data: -1, createdAt: -1 });
        return res.json(gastos);
    } catch (error) {
        console.error('Erro ao obter gastos:', error);
        return res.status(500).json({ message: "Erro ao obter gastos.", error: (error as any).message });
    }
});

router.get("/resumo", authMiddleware, async(req, res) => {
    return handleResumo(req, res, req.userId as string);
});

router.get("/resumo/:userId", authMiddleware, async(req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (req.userRole !== 'admin' && req.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para acessar este resumo." });
    }

    return handleResumo(req, res, userId);
});

router.get("/:id", authMiddleware, async (req, res) => {
    try{
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "userId inválido." });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "id inválido." });
        }

        const gasto = await GastosModel.findOne({ _id: id, userId });
        if (!gasto) {
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json(gasto);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter gasto." });
    }
});

// Rota para criar um novo gasto
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "userId não encontrado no token." });
        }

        const payload = {
            ...req.body,
            userId
        };

        const result = gastosValidationSchema.safeParse(payload);
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues });
        }

        const gasto = new GastosModel(result.data);
        await gasto.save();
        return res.status(201).json({ message: "Gasto criado com sucesso!", gasto });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar gasto." });
    }
});

router.put("/:id", authMiddleware, validate(gastosUpdateValidationSchema), async (req, res) => {
    try{
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "userId inválido." });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "id inválido." });
        }

        const gasto = await GastosModel.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );
        if (!gasto) {
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json({ message: "Gasto atualizado com sucesso!", gasto });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar gasto." });

    }
});

router.delete("/:id", authMiddleware, async( req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "userId inválido." });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "id inválido." });
        }

        const gasto = await GastosModel.findOneAndDelete({ _id: id, userId });
        if (!gasto){
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json({ message: "Gasto deletado com sucesso!"});
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar gasto." });
        }
});


export default router;