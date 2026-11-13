import express from 'express'
import { deleteUserById, listUsers, updateUserById } from '../services/user.service.js'
import { authenticate, ensureOwnUser } from '../middlewares/auth.middleware.js'
import { logAction } from '../middlewares/log.middleware.js'

export const userRouter = express.Router()

// Todas as rotas de /users exigem usuário logado.
// O cadastro de novos usuários fica em POST /auth/register.
userRouter.use(authenticate)

// Os erros lançados aqui (ou nos services) vão para o errorHandler (middlewares/error.middleware.js)

userRouter.get('/', async (req, res) => {
    const users = await listUsers()

    return res.json(users)
})

userRouter.put("/:id", ensureOwnUser, logAction('user.update', 'users'), async (req, res) => {
    const { id } = req.params
    const payload = req.body

    const user = await updateUserById(id, payload)

    return res.json(user)
})

userRouter.delete("/:id", ensureOwnUser, logAction('user.delete', 'users'), async (req, res) => {
    const { id } = req.params

    const user = await deleteUserById(id)

    return res.json(user)
})
