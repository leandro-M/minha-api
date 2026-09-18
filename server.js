import express from 'express'
import cors from 'cors'
import { connectToDatabase } from './config/database.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: "Tudo está funcionando! :)"
    })
})

connectToDatabase().then(function () {
    app.listen(process.env.PORT, () => {
        console.log("O servidor está rodando: http://localhost:" + process.env.PORT)
    })
}).catch(function (error) {
    console.log("Erro ao conectar ao banco de dados", error.message)
})