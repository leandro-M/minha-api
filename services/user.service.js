import bcrypt from "bcryptjs";
import { UserModel } from "../model/user.model.js";
import { AppError } from "../utils/app-error.js";

const SALT_ROUNDS = 10

export const hashPassword = (password) => bcrypt.hash(String(password), SALT_ROUNDS)

// A resposta de segurança é comparada sem diferenciar maiúsculas/minúsculas e espaços nas pontas
export const normalizeAnswer = (answer) => String(answer).trim().toLowerCase()

// Valida a data de nascimento: precisa ser uma data válida e não pode estar no futuro
const parseDateOfBirth = (dateOfBirth) => {
    if (dateOfBirth === undefined || dateOfBirth === null || dateOfBirth === "") {
        return undefined
    }

    const date = new Date(dateOfBirth)

    if (Number.isNaN(date.getTime())) {
        throw new AppError("Data de nascimento inválida", 400)
    }

    if (date > new Date()) {
        throw new AppError("A data de nascimento não pode estar no futuro", 400)
    }

    return date
}

// Prepara os campos sensíveis antes de salvar (hash de senha e resposta de segurança)
const prepareUserData = async (payload) => {
    const data = { ...payload }

    if ("dateOfBirth" in data) {
        data.dateOfBirth = parseDateOfBirth(data.dateOfBirth)
    }

    if (data.password) {
        data.password = await hashPassword(data.password)
    }

    if (data.securityAnswer) {
        data.securityAnswer = await bcrypt.hash(normalizeAnswer(data.securityAnswer), SALT_ROUNDS)
    }

    return data
}

export const createUser = async (payload) => {
    const data = await prepareUserData(payload)

    const user = await UserModel.create(data)

    return user
}

export const listUsers = async () => {
    const users = await UserModel.find()

    return users
}

export const updateUserById = async (id, payload) => {
    const data = await prepareUserData(payload)

    const user = await UserModel.findByIdAndUpdate(id, data, {
        returnDocument: "after", // devolve o documento já atualizado
        runValidators: true      // aplica as validações do schema no update
    })

    if (!user) {
        throw new AppError("Usuário não encontrado", 404)
    }

    return user
}

export const deleteUserById = async (id) => {
    const user = await UserModel.findByIdAndDelete(id)

    if (!user) {
        throw new AppError("Usuário não encontrado", 404)
    }

    return user
}
