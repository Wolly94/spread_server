import WebSocket from 'ws'
import { exampleMap, SpreadMap } from '../shared/game/map'
import { SpreadGame } from '../shared/game/spreadGame'
import ClientMessage from '../shared/clientMessage'
import { OpenGame } from '../shared/findGame/findGameServerMessages'
import GameClientMessageData from '../shared/inGame/gameClientMessages'
import GameServerMessage, {
    SetPlayerIdMessage,
} from '../shared/inGame/gameServerMessages'
import FindGameServerHandler from './findGameServerHandler'
import SocketServer from './socketServer'

interface ConnectedPlayer {
    token: string
    socket: WebSocket
    playerId: number | null
}

class SpreadGameServer extends SocketServer<
    GameServerMessage,
    ClientMessage<GameClientMessageData>
> {
    gameState: SpreadGame | null
    intervalId: NodeJS.Timeout | null
    playerTokens: Set<string>
    connectedPlayers: ConnectedPlayer[]

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        super(port)
        this.gameState = null
        this.intervalId = null
        this.playerTokens = new Set()
        this.connectedPlayers = []
    }

    getPlayerIdFromToken(token: string) {
        const player = this.connectedPlayers.find((cp) => cp.token === token)
        if (player !== undefined) return player.playerId
        else return null
    }

    updateClientGameState() {
        if (this.gameState === null) return
        const data = this.gameState.toClientGameState()
        const message: GameServerMessage = {
            type: 'gamestate',
            data: this.gameState,
        }
        this.sendMessageToClients(message)
    }

    setMap(map: SpreadMap) {
        if (this.intervalId !== null) {
            return
        }
        this.gameState = new SpreadGame(map)
        let remSeats = this.remainingSeats()
        while (remSeats.length > 0) {
            const index = this.connectedPlayers.findIndex(
                (cp) => cp.playerId === null,
            )
            if (index < 0) return
            const playerId = remSeats[0]
            this.connectedPlayers[index].playerId = playerId
            const message: SetPlayerIdMessage = {
                type: 'playerid',
                data: {
                    playerId: playerId,
                },
            }
            this.sendMessageToClient(
                this.connectedPlayers[index].socket,
                message,
            )

            remSeats = this.remainingSeats()
        }
        FindGameServerHandler.findGameServer?.updateClients()
    }

    start() {
        if (this.gameState === null) return
        const ms = 50
        this.intervalId = setInterval(() => {
            if (this.gameState !== null) {
                this.gameState.step(ms)
                this.updateClientGameState()
            }
        }, ms)
        FindGameServerHandler.findGameServer?.updateClients()
        //clearInterval(this.intervalId)
    }

    onReceiveMessage(
        client: WebSocket,
        message: ClientMessage<GameClientMessageData>,
        token: string,
    ) {
        if (message.data.type === 'sendunits' && this.gameState !== null) {
            const playerId = this.getPlayerIdFromToken(message.token)
            if (playerId != null) {
                const value = message.data.data
                this.gameState.sendUnits(
                    playerId,
                    value.senderIds,
                    value.receiverId,
                )
                console.log('message received and attack sent: ' + message)
            }
        } else if (message.data.type === 'setmap') {
            const value = message.data.data
            this.setMap(value)
            console.log('map successfully set')
        } else if (message.data.type === 'startgame') {
            this.start()
            console.log('game started')
        }
    }
    remainingSeats() {
        if (this.gameState === null) return []
        let occSeats = new Set(
            this.connectedPlayers.map((cp) =>
                cp.playerId === null ? -1 : cp.playerId,
            ),
        )
        occSeats.delete(-1)
        const seats = this.gameState.players.map((p) => p.id)
        const remainingSeats = seats.filter((id) => !occSeats.has(id))
        return remainingSeats.sort((a, b) => a - b)
    }
    onConnect(client: WebSocket, token: string) {
        const index = this.connectedPlayers.findIndex(
            (cp) => cp.token === token,
        )
        if (index < 0) {
            const remSeats = this.remainingSeats()
            const playerId = remSeats.length === 0 ? null : remSeats[0]
            this.connectedPlayers.push({
                token: token,
                socket: client,
                playerId: playerId,
            })
            if (playerId !== null) {
                const message: SetPlayerIdMessage = {
                    type: 'playerid',
                    data: {
                        playerId: playerId,
                    },
                }
                this.sendMessageToClient(client, message)
            }
        } else {
            this.connectedPlayers[index].socket = client
        }
    }
    onDisconnect(client: WebSocket, token: string) {
        this.playerTokens.delete(token)
    }

    toOpenGame() {
        const remSeats = this.remainingSeats().length
        const allSeats =
            this.gameState === null ? 0 : this.gameState.players.length
        const res: OpenGame = {
            url: this.url,
            joinedPlayers: allSeats - remSeats,
            players: allSeats,
            running: this.intervalId != null,
        }
        return res
    }
}

export default SpreadGameServer
