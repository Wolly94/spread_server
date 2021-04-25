import express from 'express'
import cors from 'cors'
import generateToken from './generateToken'
import { createFindGameServer, createGameServer } from './socketServers/creator'
import FindGameServerHandler from './socketServers/findGameServerHandler'

const allowedOrigins = ['http://localhost:3000']

const options: cors.CorsOptions = {
    origin: allowedOrigins,
}

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
app.get('/find-game', (req, res) => {
    if (FindGameServerHandler.findGameServer == null) createFindGameServer()
    const data = FindGameServerHandler.getUrlResponse()
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
