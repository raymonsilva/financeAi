import { OrcamentoMensalModel } from "../Schemes/OrçamentoMensalSchema";
import mongoose from "mongoose";

export class OrcamentoService {
    async calcularTotalMes(userId: string, mes: number, ano: number){
        const mesIndex = mes - 1;

        if(!Number.isInteger(mes) || mes < 1 || mes > 12) {
            throw new Error("Mês inválido. Use valores de 1 a 12.");
        }

        if(!Number.isInteger(ano) || ano < 1900) {
            throw new Error("Ano inválido.");
        }

        const inicio = new Date(ano, mesIndex, 1);
        const fim = new Date(ano, mesIndex + 1, 1)

        const resultado = await OrcamentoMensalModel.aggregate([{
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                mes: mes,
                ano: ano
            }
        }, {
            $group: {
                _id: null,
                total: { $sum: "$valor"}
            }
        }])
        return resultado[0]?.total || 0;
    }

    async criarOrcamento(data: any) {
        const orcamento = new OrcamentoMensalModel(data);
        return await orcamento.save();
    }

    async gastoOrcamento(id: string, valor: number) {
        const orcamento = await OrcamentoMensalModel.findById(id);
        if (!orcamento) {
            throw new Error("Orçamento não encontrado.");
        }   
        if (orcamento.valor < valor) {
            throw new Error("Valor gasto excede o orçamento disponível.");
        }
        orcamento.valor -= valor;
        return await orcamento.save();
    }

    async limiteGastos(id: string, userId: string, limite: number) {
        const orcamento = await OrcamentoMensalModel.findOne({
            _id: id,
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!orcamento) {
            return null;
        }

        orcamento.limiteGastos = limite;
        return await orcamento.save();
    }

    async calcularStatusOrcamento(userId: string, mes: number, ano: number) {
        const totalGastos = await this.calcularTotalMes(userId, mes, ano);
        const orcamento = await OrcamentoMensalModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            mes: mes,
            ano: ano
        });

        if(!orcamento) {
            throw new Error("Orçamento mensal não encontrado para o mês e ano especificados.");
        }
        const limite = orcamento.limiteGastos || 0;
        const status = totalGastos > limite ? "Excedido" : "Dentro do limite";
        return { totalGastos, limite, status };
    }

    async percentualConsumido(userId: string, mes: number, ano: number) {
        const dados = await this.calcularStatusOrcamento(userId, mes, ano);
        
        if(dados.limite === 0) {
            return { ...dados, percentual: 0, status: "ok" };
        }
        
        const percentual = (dados.totalGastos / dados.limite) * 100;
        
        let status: string;
        if (percentual < 80) {
            status = "ok";
        } else if (percentual < 100) {
            status = "atencao";
        } else {
            status = "estourado";
        }
        
        return { ...dados, percentual, status };
    }
}