import mongoose from "mongoose";
import { AppError } from "../utils/app-error.js";

// Responde 404 para qualquer rota que não foi registrada
export function notFoundHandler(req, res) {
    return res.status(404).json({
        error: "Rota não encontrada"
    })
}

// Middleware de erro compartilhado.
// No Express 5, se um handler async lançar erro (ou a Promise for rejeitada),
// o erro chega aqui automaticamente, por isso as rotas não precisam de try/catch.
export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
    }

    // Erros de validação do schema do Mongoose (campo obrigatório, etc.)
    if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message)
        return res.status(400).json({ error: messages.join(", ") })
    }

    // ID com formato inválido (ex.: /users/123)
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: "ID inválido" })
    }

    // Índice único violado (e-mail repetido)
    if (error.code === 11000) {
        return res.status(409).json({ error: "E-mail já cadastrado" })
    }

    // Token JWT inválido ou expirado
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token inválido ou expirado" })
    }

    // JSON mal formatado no body da requisição
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON inválido no corpo da requisição" })
    }

    console.error("Erro inesperado:", error)
    return res.status(500).json({ error: "Erro interno do servidor" })
}
