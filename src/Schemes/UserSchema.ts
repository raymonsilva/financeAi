import mongoose from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";

// Validação Zod
export const userValidationSchema = z.object({
    email: z.string(),
    password: z.string().min(8, { message: "A senha deve conter pelo menos 8 Caracteres"}).
    max(20, { message: "A senha não pode passar de 20 Caracteres"})
    .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minuscula"})
    .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiuscula"})
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um numero"})
    .regex(/[^a-zA-Z0-9]/, { message: "A senha deve conter pelo menos um caractere especial."}),
    nome: z.string(),
    salario: z.number().positive("Valor deve ser positivo")
});

export type User = z.infer<typeof userValidationSchema>;

// Schema Mongoose para armazenar dados
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    nome: {
        type: String,
        required: true
    },
    salario: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    }
});

UserSchema.pre('save', async function(next) {
    const user = this as any;

    if (!user.isModified('password')) return;

    const hash = await bcrypt.hash(user.password, 10);
    
    user.password = hash;

});

UserSchema.methods.comparePassword =  async function(candidatePassword: string): Promise<boolean> {
    const user = this as any;
    return bcrypt.compare(candidatePassword, user.password);
};

export const UserModel = mongoose.model('User', UserSchema);