import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/user.model.js";
import { AppError } from "../utils/app-error.js";
import { createUser, hashPassword, normalizeAnswer } from "./user.service.js";

const generateToken = (user) => {
    return jwt.sign(
        { sub: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    )
}

const requireFields = (fields) => {
    const missing = Object.entries(fields)
        .filter(([, value]) => !value)
        .map(([name]) => name)

    if (missing.length > 0) {
        throw new AppError(`Campos obrigatórios: ${missing.join(", ")}`, 400)
    }
}

export const register = async (payload) => {
    return createUser(payload)
}

export const login = async (email, password) => {
    requireFields({ email, password })

    const user = await UserModel.findOne({ email: String(email).toLowerCase().trim() }).select("+password")

    // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem)
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
        throw new AppError("E-mail ou senha inválidos", 401)
    }

    const token = generateToken(user)

    return { token, user }
}

// 1º passo do reset: o usuário informa o e-mail e recebe a pergunta de segurança cadastrada
export const getSecurityQuestion = async (email) => {
    requireFields({ email })

    const user = await UserModel.findOne({ email: String(email).toLowerCase().trim() })

    if (!user) {
        throw new AppError("Usuário não encontrado", 404)
    }

    return { securityQuestion: user.securityQuestion }
}

// 2º passo do reset: o usuário responde a pergunta e define a nova senha
export const resetPassword = async (email, securityAnswer, newPassword) => {
    requireFields({ email, securityAnswer, newPassword })

    const user = await UserModel.findOne({ email: String(email).toLowerCase().trim() }).select("+securityAnswer")

    if (!user || !(await bcrypt.compare(normalizeAnswer(securityAnswer), user.securityAnswer))) {
        throw new AppError("Resposta de segurança incorreta", 401)
    }

    user.password = await hashPassword(newPassword)
    await user.save()

    return user
}
