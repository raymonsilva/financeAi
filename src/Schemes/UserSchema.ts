import mongoose from "mongoose";
import { z } from "zod";

// Validação Zod
export const userValidationSchema = z.object({
    nome: z.string(),
    salario: z.number().positive("Valor deve ser positivo")
});

export type User = z.infer<typeof userValidationSchema>;

// Schema Mongoose para armazenar dados
const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    salario: {
        type: Number,
        required: true
    }
});

export const UserModel = mongoose.model('User', UserSchema);