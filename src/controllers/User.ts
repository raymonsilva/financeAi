import express from 'express';
import validate from '../middlewares/validate.middleware';
import { UserModel, userValidationSchema } from '../Schemes/UserSchema';

const router = express.Router();

// Rota para obter usuário
router.get("/", async(req, res) => {
    try{
        const user = await UserModel.find();
        return res.json(user);
    } catch (error){
        return res.status(500).json({ message: "Erro ao obter usuário."});
    }
});

router.get("/:id", async(req, res) => {
    try{
        const user = await UserModel.find();
        return res.json(user);
    } catch (error){
        return res.status(500).json({ message: "Erro ao obter usuário."});
    }
});


router.post("/", validate(userValidationSchema), async(req, res) => {
    try {
        const user = new UserModel(req.body);
        await user.save();
        return res.status(201).json({ message: "Usuário criado com sucesso.", user});
    } catch(error){
        return res.status(500).json({ message: "Erro ao criar usuário"});
    }
});

router.put("/:id", validate(userValidationSchema), async(req, res) =>{
    try{
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado"});
        }
        return res.status(201).json({ message: "Usuário atualizado com sucesso!", user});
    } catch(error){
        return res.status(500).json({ message: "Erro ao atualizar usuário."});
    }
    
});

router.delete("/:id", async(req, res) => {
    try{
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ message: "Usuário não encontrado."});
        }
        return res.status(201).json({ message: "Usuário deletado com sucesso!", user});
    } catch(error){
        return res.status(500).json({ message: "Erro ao deletar usuário."});
    }
});

export default router;