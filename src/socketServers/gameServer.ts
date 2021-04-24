import WebSocket from 'ws'
import { exampleMap } from '../game/map'
import { SpreadGame } from '../game/spreadGame'
import ClientMessage from '../shared/clientMessage'
import GameClientMessageData from '../shared/inGame/gameClientMessages'
import GameServerMessage from '../shared/inGame/gameServerMessages'
import SocketServer from './socketServer'

interface CreateSocketResponse {
    url: string
}

export let runningGameServers: SpreadGameServer[] = []
let currentPort = 3030

const nextPort = () => {
    currentPort += 1
    return currentPort
}

class SpreadGameServer extends SocketServer<
    GameServerMessage,
    ClientMessage<GameClientMessageData>
> {
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    playerTokens: Map<string, number>
    latestPlayerId: number

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        super(port)
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

    updateClientGameState() {
        const data = this.gameState.toClientGameState()
        const message: GameServerMessage = {
            type: 'gamestate',
            data: this.gameState,
        }
        this.sendMessageToClients(message)
    }

    start() {
        const ms = 50
        this.intervalId = setInterval(() => {
            this.gameState.step(ms)
            this.updateClientGameState()
        }, ms)
        //clearInterval(this.intervalId)
    }

    onReceiveMessage(
        client: WebSocket,
        message: ClientMessage<GameClientMessageData>,
        token: string,
    ) {
        const playerId = this.getPlayerIdFromToken(message.token)
        if (playerId != null) {
            if (message.data.type == 'sendunits') {
                const value = message.data.data
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
    }
    onDisconnect(client: WebSocket, token: string) {
        this.playerTokens.delete(token)
    }
}

export default SpreadGameServer
