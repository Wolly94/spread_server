import WebSocket from 'ws'
import { exampleMap } from '../game/map'
import { SpreadGame } from '../game/spreadGame'
import ClientMessage from '../shared/clientMessage'
import { OpenGame } from '../shared/findGame/findGameServerMessages'
import GameClientMessageData from '../shared/inGame/gameClientMessages'
import GameServerMessage, {
    SetPlayerIdMessage,
} from '../shared/inGame/gameServerMessages'
import FindGameServerHandler from './findGameServerHandler'
import SocketServer from './socketServer'

class SpreadGameServer extends SocketServer<
    GameServerMessage,
    ClientMessage<GameClientMessageData>
> {
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    playerTokens: Set<string>
    latestPlayerId: number
    activePlayers: string[] // storing the player token at the id of the player

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        super(port)
        const map = exampleMap()
        this.gameState = new SpreadGame(exampleMap(), [{ id: 1 }, { id: 0 }])
        this.intervalId = null
        this.latestPlayerId = -1
        this.playerTokens = new Set()
        this.activePlayers = new Array<string>(map.players)
    }

    getPlayerIdFromToken(token: string) {
        const playerId = this.activePlayers.findIndex((to) => to === token)
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
        FindGameServerHandler.findGameServer?.updateClients()
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
        let existing = this.activePlayers.findIndex((to) => to === token)
        if (existing === -1) {
            this.playerTokens.add(token)
            // find empty seat
            let found = false
            let i = 0
            while (!found && i < this.activePlayers.length) {
                if (this.activePlayers[i] == undefined) {
                    found = true
                } else {
                    i += 1
                }
            }
            if (i < this.activePlayers.length) {
                this.activePlayers[i] = token
                existing = i
            }
        }
        if (existing < this.activePlayers.length) {
            const message: SetPlayerIdMessage = {
                type: 'playerid',
                data: {
                    playerId: existing,
                },
            }
            this.sendMessageToClient(client, message)
        }
    }
    onDisconnect(client: WebSocket, token: string) {
        this.playerTokens.delete(token)
    }

    toOpenGame() {
        const res: OpenGame = {
            url: this.url,
            joinedPlayers: this.activePlayers.filter((p) => p != undefined)
                .length,
            players: this.activePlayers.length,
            running: this.intervalId != null,
        }
        return res
    }
}

export default SpreadGameServer
