import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { UserModel } from '../Schemes/UserSchema';
import { GastosModel } from '../Schemes/GastosSchema';
import { OrcamentoMensalModel } from '../Schemes/OrçamentoMensalSchema';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/full', async (_req, res) => {
  try {
    const [users, gastos, orcamentos] = await Promise.all([
      UserModel.find().select('-password').sort({ createdAt: -1 }),
      GastosModel.find().sort({ createdAt: -1 }),
      OrcamentoMensalModel.find().sort({ ano: -1, mes: -1 })
    ]);

    return res.json({
      totals: {
        users: users.length,
        gastos: gastos.length,
        orcamentos: orcamentos.length
      },
      users,
      gastos,
      orcamentos
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar dados administrativos.' });
  }
});

router.delete('/cleanup', async (req, res) => {
  try {
    const {
      clearUsers = false,
      clearGastos = true,
      clearOrcamentos = true
    } = req.body ?? {};

    const operations: Promise<any>[] = [];

    if (clearGastos) {
      operations.push(GastosModel.deleteMany({}));
    }

    if (clearOrcamentos) {
      operations.push(OrcamentoMensalModel.deleteMany({}));
    }

    if (clearUsers) {
      operations.push(UserModel.deleteMany({ role: { $ne: 'admin' } }));
    }

    await Promise.all(operations);

    return res.json({
      message: 'Limpeza administrativa concluída com sucesso.',
      executed: {
        clearUsers,
        clearGastos,
        clearOrcamentos
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao executar limpeza administrativa.' });
  }
});

router.delete('/orcamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'id é obrigatório.' });
    }

    const deleted = await OrcamentoMensalModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }

    return res.status(200).json({ message: 'Orçamento removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao remover orçamento.' });
  }
});

export default router;
