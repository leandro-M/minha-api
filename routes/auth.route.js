import express from 'express'
import { getSecurityQuestion, login, register, resetPassword } from '../services/auth.service.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { logAction } from '../middlewares/log.middleware.js'

export const authRouter = express.Router()

// Cadastro público de usuário
authRouter.post('/register', logAction('user.register', 'auth'), async (req, res) => {
    const user = await register(req.body)

    res.locals.userId = user._id
    res.locals.resourceId = user.id

    return res.status(201).json(user)
})

authRouter.post('/login', logAction('auth.login', 'auth'), async (req, res) => {
    const { email, password } = req.body

    const { token, user } = await login(email, password)

    res.locals.userId = user._id

    return res.json({ token, user })
})

// Reset de senha - passo 1: devolve a pergunta de segurança do e-mail informado
authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body

    const result = await getSecurityQuestion(email)

    return res.json(result)
})

// Reset de senha - passo 2: confere a resposta e troca a senha
authRouter.post('/reset-password', logAction('auth.reset-password', 'auth'), async (req, res) => {
    const { email, securityAnswer, newPassword } = req.body

    const user = await resetPassword(email, securityAnswer, newPassword)

    res.locals.userId = user._id

    return res.json({ message: "Senha alterada com sucesso" })
})

// Dados do usuário logado
authRouter.get('/me', authenticate, async (req, res) => {
    return res.json(req.user)
})
