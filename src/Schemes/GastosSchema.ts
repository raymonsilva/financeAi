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
    userId: z.string().min(1, "userId é obrigatório"),
});

export const gastosUpdateValidationSchema = gastosValidationSchema
    .omit({ userId: true })
    .partial();


export type Gastos = z.infer<typeof gastosValidationSchema>;

// Schema do Mongoose para armazenar dados
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
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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