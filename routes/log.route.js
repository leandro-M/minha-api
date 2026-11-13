import express from 'express'
import { listLogsByUser } from '../services/log.service.js'
import { authenticate } from '../middlewares/auth.middleware.js'

export const logRouter = express.Router()

logRouter.use(authenticate)

// Últimas ações feitas pelo usuário logado
logRouter.get('/', async (req, res) => {
    const logs = await listLogsByUser(req.user._id)

    return res.json(logs)
})
