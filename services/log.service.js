import { ActionLogModel } from "../model/log.model.js";

// Salva a ação no banco e mostra no console.
// Se o log falhar, só registra o erro: o log nunca pode derrubar a requisição do usuário.
export const saveActionLog = async (data) => {
    console.log(`[LOG] ${new Date().toISOString()} ${data.action} user=${data.user ?? "-"} ${data.method} ${data.path} ${data.statusCode}`)

    try {
        await ActionLogModel.create(data)
    } catch (error) {
        console.error("Erro ao salvar log de ação:", error.message)
    }
}

export const listLogsByUser = async (userId) => {
    const logs = await ActionLogModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(100)

    return logs
}
