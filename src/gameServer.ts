import WebSocket from 'ws'
import { exampleMap } from './game/map'
import { SpreadGame } from './game/spreadGame'
import generateToken from './generateToken'
import ClientMessage from './shared/clientMessages'
import ServerMessage from './shared/serverMessages'

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
    playerTokens: Map<string, number>
    latestPlayerId: number

    // later allow connecting other players and read data like skills accordingly
    constructor(socketId: string) {
        const port = nextPort()
        this.socket = new WebSocket.Server({ port: port })
        this.url = 'ws://localhost:' + port.toString() + '/'
        this.gameState = new SpreadGame(exampleMap(), [{ id: 1 }, { id: 0 }])
        this.intervalId = null
        this.latestPlayerId = -1
        this.playerTokens = new Map()
    }

    getPlayerIdFromToken(token: string) {
        const playerId = this.playerTokens.get(token)
        if (playerId == undefined) return null
        else return playerId
    }

    // socket now accepts connections from clients
    open() {
        this.socket.on('connection', (socketClient, req) => {
            const url = req.url
            const token = req.url?.replace('/?token=', '')
            if (token != undefined) {
                this.onConnect(socketClient, token)
            }
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
        const data = this.gameState.toClientGameState()
        const message: ServerMessage = {
            type: 'gamestate',
            data: this.gameState,
        }
        this.sendMessageToClients(JSON.stringify(message))
    }

    start() {
        const ms = 50
        this.intervalId = setInterval(() => {
            this.gameState.step(ms)
            this.updateClientGameState()
        }, ms)
        //clearInterval(this.intervalId)
    }

    onReceiveMessage(client: WebSocket, message: string) {
        const clientMessage: ClientMessage = JSON.parse(message)
        const playerId = this.getPlayerIdFromToken(clientMessage.token)
        if (playerId != null) {
            if (clientMessage.data.type == 'sendunits') {
                const value = clientMessage.data.data
                this.gameState.sendUnits(
                    playerId,
                    value.senderIds,
                    value.receiverId,
                )
                console.log('message received and attack sent: ' + message)
            }
        }
    }

    onConnect(client: WebSocket, token: string) {
        this.latestPlayerId += 1
        this.playerTokens.set(token, this.latestPlayerId)

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
    runningGameServers.push(gameServer)
    const resp: CreateSocketResponse = {
        url: gameServer.url,
    }
    return resp
}

export default SpreadGameServer
