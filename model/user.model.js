import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "O nome é obrigatório"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "O e-mail é obrigatório"],
        unique: true,
        trim: true,
        lowercase: true
    },
    // select: false -> a senha não vem nas consultas, só quando pedimos com .select("+password")
    password: {
        type: String,
        required: [true, "A senha é obrigatória"],
        select: false
    },
    dateOfBirth: Date,
    lgpd: Boolean,
    documents: [
        {
            label: String,
            value: String
        }
    ],
    // Pergunta de segurança usada no reset de senha (ex.: "Qual o nome do seu primeiro animal?")
    securityQuestion: {
        type: String,
        required: [true, "A pergunta de segurança é obrigatória"],
        trim: true
    },
    // Resposta salva com hash, igual à senha
    securityAnswer: {
        type: String,
        required: [true, "A resposta de segurança é obrigatória"],
        select: false
    }
}, {
    timestamps: true,
    toJSON: {
        // Garantia extra: nunca devolver dados sensíveis no JSON
        transform: (doc, ret) => {
            delete ret.password
            delete ret.securityAnswer
            delete ret.__v
            return ret
        }
    }
})

export const UserModel = mongoose.model("Users", userSchema)
