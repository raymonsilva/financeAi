import express from 'express';
import validate from '../middlewares/validate.middleware';
import { gastosValidationSchema, GastosModel } from '../Schemes/GastosSchema';

const router = express.Router();

// Rota para obter os gastos
router.get("/", async (req, res) => {
    try {
        const gastos = await GastosModel.find();
        return res.json(gastos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter gastos." });
    }
});

router.get("/:id", async (req, res) => {
    try{
        const gasto = await GastosModel.findById(req.params.id, req.body, { new: true });
        if (!gasto) {
            return res.status(404).json({ message: "Gasto não encontrado." });
        }
        return res.json(gasto);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao obter gasto." });
    }
});

// Rota para criar um novo gasto
router.post("/", validate(gastosValidationSchema), async (req, res) => {
    try {
        const gasto = new GastosModel(req.body);
        await gasto.save();
        return res.status(201).json({ message: "Gasto criado com sucesso!", gasto });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar gasto." });
    }
});

router.put("/:id", validate(gastosValidationSchema), async (req, res) => {
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