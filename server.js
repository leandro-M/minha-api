import express from 'express'
import cors from 'cors'
import { connectToDatabase } from './config/database.js'
import { authRouter } from './routes/auth.route.js'
import { userRouter } from './routes/user.route.js'
import { logRouter } from './routes/log.route.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'

if (!process.env.JWT_SECRET) {
    console.log("Variável JWT_SECRET não definida no .env")
    process.exit(1)
}

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: "Tudo está funcionando! :)"
    })
})

app.use("/auth", authRouter)
app.use("/users", userRouter)
app.use("/logs", logRouter)

// Precisam ficar depois de todas as rotas
app.use(notFoundHandler)
app.use(errorHandler)

connectToDatabase().then(function () {
    app.listen(process.env.PORT, () => {
        console.log("O servidor está rodando: http://localhost:" + process.env.PORT)
    })
}).catch(function (error) {
    console.log("Erro ao conectar ao banco de dados", error.message)
})
