import { GastosModel } from "../Schemes/GastosSchema";
import mongoose from "mongoose";

export class GastosService {
    async calcularTotalMes(userId: string, mes: number, ano: number){
        const mesIndex = mes - 1;

        if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
            throw new Error("Mês inválido. Use valores de 1 a 12.");
        }

        if (!Number.isInteger(ano) || ano < 1900) {
            throw new Error("Ano inválido.");
        }

        const inicio = new Date(ano, mesIndex, 1);
        const fim = new Date(ano, mesIndex + 1, 1)

    const resultado = await GastosModel.aggregate([{
        $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: inicio, $lt: fim }
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: "$valor"}
        }
    }])

    return resultado[0]?.total || 0
    }
}