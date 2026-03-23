import mongoose from 'mongoose';
import { z } from 'zod';

// Schema de validação com Zod
export const gastosValidationSchema = z.object({
    descricao: z.string()
        .min(3, "Descrição deve ter pelo menos 3 caracteres")
        .max(100, "Descrição não pode exceder 100 caracteres"),
    valor: z.number()
        .positive("Valor deve ser positivo"),
    categoria: z.string()
        .optional()
        .default("Geral"),
    data: z.coerce.date()
        .optional()
        .default(() => new Date()),
});

// Tipo inferido do Zod
export type Gastos = z.infer<typeof gastosValidationSchema>;

// Schema do Mongoose para persistência no banco
const GastosSchema = new mongoose.Schema({
    descricao: {
        type: String,
        required: true,
    },
    valor: {
        type: Number,
        required: true,
    },
    categoria: {
        type: String,
        default: "Geral",
    },
    data: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Modelo do Mongoose
export const GastosModel = mongoose.model('Gastos', GastosSchema);