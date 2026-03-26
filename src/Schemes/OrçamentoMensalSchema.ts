import mongoose from "mongoose";
import { z } from "zod";

export const orcamentoMensalValidationSchema = z.object({
    mes: z.number()
        .int("Mês deve ser um número inteiro")
        .min(1, "Mês deve ser entre 1 e 12")
        .max(12, "Mês deve ser entre 1 e 12"),
    ano: z.number().int("Ano deve ser um número inteiro"),
    valor: z.number().positive("Valor deve ser positivo"),
    limiteGastos: z.number().positive("Limite de gastos deve ser positivo").optional(),
});

export const orcamentoMensalUpdateValidationSchema = orcamentoMensalValidationSchema
    .partial(); 

export type OrcamentoMensal = z.infer<typeof orcamentoMensalValidationSchema>;

const OrcamentoMensalSchema = new mongoose.Schema({
    mes: {
        type: Number,
        required: true,
    },
    ano: {
        type: Number,
        required: true,
    },
    valor: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    limiteGastos: {
        type: Number,
        default: null,
    }
});

export const OrcamentoMensalModel = mongoose.model("OrcamentoMensal", OrcamentoMensalSchema);