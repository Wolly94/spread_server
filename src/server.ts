import express from 'express'
import cors from 'cors'
import { createGameServer } from './gameServer'
import generateToken from './generateToken'

const allowedOrigins = ['http://localhost:3000']

const options: cors.CorsOptions = {
    origin: allowedOrigins,
}

interface MyInterface {
    id: number
}

const l: MyInterface[] = [{ id: 1 }, { id: 2 }]
const newL = l.filter((n) => {
    n.id *= 2
    return true
})
console.log(newL)

const app = express()
app.use(cors(options))
app.use(express.json())

app.get('/', (req, res) => {
    res.send({ message: 'test' })
})

app.post('/create-game', (req, res) => {
    const data = createGameServer()
    res.send(data)
})

app.get('/token', (req, res) => {
    const token = generateToken()
    res.send({ token: token })
})

const port = 8765

app.listen(port, () => {
    console.log(`listening http://localhost:${port}`)
})
