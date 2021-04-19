import WebSocket from 'ws'
import generateToken from './generateToken'

interface GameSocketServer {
    serverId: string
    socket: WebSocket.Server
    url: string
}

interface CreateSocketResponse {
    url: string
}

let runningGameServers: GameSocketServer[] = []
let currentPort = 3030

const nextPort = () => {
    currentPort += 1
    return currentPort
}

const setupServer = (socketId: string) => {
    const port = nextPort()
    const wss = new WebSocket.Server({ port: port })
    const path = 'ws://localhost:' + port.toString() + '/'

    wss.on('connection', (socketClient) => {
        console.log('connected')
        console.log('client Set length: ', wss.clients.size)

        socketClient.on('close', (socketClient) => {
            console.log('closed')
            console.log('Number of clients: ', wss.clients.size)
        })
    })

    return {
        serverId: socketId,
        socket: wss,
        url: path,
    }
}

export const createGameServer = () => {
    const socketId = generateToken()
    const gameServer = setupServer(socketId)
    runningGameServers.push(gameServer)
    const resp: CreateSocketResponse = {
        url: gameServer.url,
    }
    return resp
}
