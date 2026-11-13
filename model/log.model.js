import mongoose from "mongoose";

// Registro de cada ação feita na API (quem fez, o quê, em qual recurso e quando)
const actionLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    action: String,      // ex.: "user.update", "auth.login"
    resource: String,    // ex.: "users", "auth"
    resourceId: String,  // id do registro afetado
    method: String,
    path: String,
    statusCode: Number,
    ip: String
}, {
    timestamps: true
})

export const ActionLogModel = mongoose.model("Logs", actionLogSchema)
