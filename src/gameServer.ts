import WebSocket from 'ws'
import { exampleMap } from './game/map'
import { SpreadGame } from './game/spreadGame'
import generateToken from './generateToken'

interface CreateSocketResponse {
    url: string
}

let runningGameServers: SpreadGameServer[] = []
let currentPort = 3030

const nextPort = () => {
    currentPort += 1
    return currentPort
}

class SpreadGameServer {
    socket: WebSocket.Server
    url: string
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    playerTokens: string[]

    // later allow connecting other players and read data like skills accordingly
    constructor(socketId: string) {
        const port = nextPort()
        this.socket = new WebSocket.Server({ port: port })
        this.url = 'ws://localhost:' + port.toString() + '/'
        this.gameState = new SpreadGame(exampleMap(), [{ id: 1 }, { id: 0 }])
        this.intervalId = null
        this.playerTokens = []
    }

    // socket now accepts connections from clients
    open() {
        this.socket.on('connection', (socketClient, req) => {
            const url = req.url
            const token = req.url?.replace('/?token=', '')
            // TODO validate token
            this.onConnect(socketClient)
        })
    }

    sendMessageToClients(message: string) {
        this.socket.clients.forEach((client) => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(message)
            }
        })
    }

    updateClientGameState() {
        var message = this.gameState.stringify()
        this.sendMessageToClients(message)
    }

    start() {
        const ms = 1000
        this.intervalId = setInterval(() => {
            this.gameState.step(ms)
            this.updateClientGameState()
        }, 1000)
        //clearInterval(this.intervalId)
    }

    onReceiveMessage(client: WebSocket, message: string) {
        const x = message
        // TODO decode token as above
        const token = ''
        console.log('message received: ' + message)
    }

    onConnect(client: WebSocket) {
        console.log('connected with url: ', client.url)
        console.log('client Set length: ', this.socket.clients.size)

        // gets fired when server receives message from client
        client.on('message', (message) => {
            const url = client.url
            this.onReceiveMessage(client, message.valueOf().toString())
        })

        // gets fired on close
        client.on('close', () => {
            this.onDisconnect(client)
        })
    }

    onDisconnect(client: WebSocket) {
        console.log('closed')
        console.log('Number of clients: ', this.socket.clients.size)
    }
}

export const createGameServer = () => {
    const socketId = generateToken()
    const gameServer = new SpreadGameServer(socketId)
    gameServer.open()
    gameServer.start()
    //const gameServer = setupServer(socketId)
    runningGameServers.push(gameServer)
    const resp: CreateSocketResponse = {
        url: gameServer.url,
    }
    return resp
}

export default SpreadGameServer
