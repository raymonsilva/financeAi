import express from 'express';
import validate from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserModel, userValidationSchema } from '../Schemes/UserSchema';
import { JWTService } from '../utils/jwt';
import { z } from 'zod';

const router = express.Router();

// Schema para login
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Senha é obrigatória")
});

// Rota de registr (sem autenticação)
router.post("/register", validate(userValidationSchema), async(req, res) => {
    try {
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email já registrado" });
        }

        const user = new UserModel(req.body);
        await user.save();
        
        const token = JWTService.generateToken({
            userId: user._id.toString(),
            email: user.email
        });

        return res.status(201).json({ 
            message: "Usuário criado com sucesso.", 
            token,
            user: {
                id: user._id,
                email: user.email,
                nome: user.nome
            }
        });
    } catch(error){
        return res.status(500).json({ message: "Erro ao criar usuário"});
    }
});

// Rota de login
router.post("/login", validate(loginSchema), async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const isPasswordValid = await (user as any).comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const token = JWTService.generateToken({
            userId: user._id.toString(),
            email: user.email
        });

        return res.json({ 
            message: "Login realizado com sucesso.",
            token,
            user: {
                id: user._id,
                email: user.email,
                nome: user.nome
            }
        });
    } catch(error){
        return res.status(500).json({ message: "Erro ao fazer login"});
    }
});

// Rota para obter usuário (protegida)
router.get("/", authMiddleware, async(req, res) => {
    try{
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.json(user);
    } catch (error){
        return res.status(500).json({ message: "Erro ao obter usuário."});
    }
});

router.get("/:id", authMiddleware, async(req, res) => {
    try{
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.json(user);
    } catch (error){
        return res.status(500).json({ message: "Erro ao obter usuário."});
    }
});

router.put("/:id", authMiddleware, validate(userValidationSchema), async(req, res) =>{
    try{
        if (req.userId !== req.params.id) {
            return res.status(403).json({ message: "Você não tem permissão para atualizar este usuário" });
        }

        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado"});
        }
        return res.status(200).json({ message: "Usuário atualizado com sucesso!", user});
    } catch(error){
        return res.status(500).json({ message: "Erro ao atualizar usuário."});
    }
});

router.delete("/:id", authMiddleware, async(req, res) => {
    try{
        if (req.userId !== req.params.id) {
            return res.status(403).json({ message: "Você não tem permissão para deletar este usuário" });
        }

        const user = await UserModel.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado."});
        }
        return res.json({ message: "Usuário deletado com sucesso!", user});
    } catch(error){
        return res.status(500).json({ message: "Erro ao deletar usuário."});
    }
});

export default router;