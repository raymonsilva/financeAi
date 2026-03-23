import express from 'express';
import mongoose from 'mongoose';
import validate from '../middlewares/validate.middleware';
import { gastosValidationSchema, gastosUpdateValidationSchema, GastosModel } from '../Schemes/GastosSchema';
import { GastosService } from '../services/gastos.service';
import { UserModel } from '../Schemes/UserSchema';

const gastosService = new GastosService();
const router = express.Router();

const getUserId = (req: express.Request) => {
    const queryUserIdRaw = req.query.userId ?? req.query.userID ?? req.query.userid;
    const bodyUserIdRaw = req.body?.userId ?? req.body?.userID ?? req.body?.userid;
    const paramsUserIdRaw = req.params.userId ?? req.params.id;
    const headerUserIdRaw = req.headers['x-user-id'] ?? req.headers['x-userid'] ?? req.headers['userid'];
    const value = bodyUserIdRaw ?? queryUserIdRaw ?? paramsUserIdRaw ?? headerUserIdRaw;

    if (Array.isArray(value)) {
        return value[0]?.toString().trim();
    }

    return value?.toString().trim();
};

const handleResumo = async (req: express.Request, res: express.Response) => {
    try {
        const { mes, ano } = req.query;
        const now = new Date();
        const mesNumero = mes ? Number(mes) : now.getMonth() + 1;
        const anoNumero = ano ? Number(ano) : now.getFullYear();

        const userId = getUserId(req) as string;
        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório (envie em body, query, params ou header x-user-id)." });
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

        return res.json({
            nome: usuario.nome,
            salario: usuario.salario,
            gastos: totalGastos,
            saldo
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao calcular resumo." });
    }
};

// Rota para obter os gastos
router.get("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (userId && !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
        }

        const filter = userId ? { userId } : {};
        const gastos = await GastosModel.find(filter).sort({ data: -1, createdAt: -1 });
        return res.json(gastos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter gastos." });
    }
});

router.get("/resumo", async(req, res) => {
    return handleResumo(req, res);
});

router.get("/resumo/:userId", async(req, res) => {
    return handleResumo(req, res);
});

router.get("/:id", async (req, res) => {
    try{
        const gasto = await GastosModel.findById(req.params.id);
        if (!gasto) {
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json(gasto);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter gasto." });
    }
});

// Rota para criar um novo gasto
router.post("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório (envie em body, query, params ou header x-user-id)." });
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "userId inválido." });
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

router.put("/:id", validate(gastosUpdateValidationSchema), async (req, res) => {
    try{
        const gasto = await GastosModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!gasto) {
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json({ message: "Gasto atualizado com sucesso!", gasto });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar gasto." });

    }
});

router.delete("/:id", async( req, res) => {
    try {
        const gasto = await GastosModel.findByIdAndDelete(req.params.id);
        if (!gasto){
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json({ message: "Gasto deletado com sucesso!"});
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar gasto." });
        }
});


export default router;