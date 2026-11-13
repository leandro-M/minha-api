import jwt from "jsonwebtoken";
import { UserModel } from "../model/user.model.js";
import { AppError } from "../utils/app-error.js";

// Identifica o usuário logado a partir do header "Authorization: Bearer <token>"
// e deixa disponível em req.user para as próximas camadas.
export async function authenticate(req, res, next) {
    const [type, token] = (req.headers.authorization || "").split(" ")

    if (type !== "Bearer" || !token) {
        throw new AppError("Token não informado", 401)
    }
    console.log("type", type)
    console.log("token", token)

    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await UserModel.findById(payload.sub)

    if (!user) {
        throw new AppError("Usuário do token não existe mais", 401)
    }

    req.user = user
    next()
}

// Garante que o usuário logado só altere/exclua a própria conta (/users/:id)
export function ensureOwnUser(req, res, next) {
    if (req.params.id !== req.user.id) {
        throw new AppError("Você só pode alterar a sua própria conta", 403)
    }

    next()
}
