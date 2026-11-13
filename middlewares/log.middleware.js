import { saveActionLog } from "../services/log.service.js";

// Camada de log de ações. Uso: router.put("/:id", logAction("user.update", "users"), handler)
// Espera a resposta terminar e, se deu certo (status < 400), registra quem fez o quê.
// Rotas sem usuário logado (login, cadastro, reset) informam o usuário em res.locals.userId.
export function logAction(action, resource) {
    return (req, res, next) => {
        res.on("finish", () => {
            if (res.statusCode >= 400) return

            saveActionLog({
                user: req.user?._id ?? res.locals.userId,
                action,
                resource,
                resourceId: req.params.id ?? res.locals.resourceId,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ip: req.ip
            })
        })

        next()
    }
}
