// Erro "conhecido" da aplicação: carrega a mensagem e o status HTTP que deve ser devolvido.
// Use nos services: throw new AppError("Usuário não encontrado", 404)
export class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message)
        this.name = "AppError"
        this.statusCode = statusCode
    }
}
