import WebSocket from 'ws'
import { exampleMap, getPlayerIds, SpreadMap } from '../../shared/game/map'
import { SpreadGame } from '../../shared/game/spreadGame'
import ClientMessage from '../../shared/clientMessage'
import { OpenGame } from '../../shared/findGame/findGameServerMessages'
import GameClientMessageData, {
    isClientLobbyMessage,
} from '../../shared/inGame/gameClientMessages'
import GameServerMessage, {
    SetPlayerIdMessage,
} from '../../shared/inGame/gameServerMessages'
import FindGameServerHandler from '../findGameServerHandler'
import SocketServer from '../socketServer'
import InGameImplementation, { InGame } from './inGame'
import LobbyImplementation, { Lobby } from './lobby'

interface ConnectedPlayer {
    token: string
    socket: WebSocket
    playerId: number | null
}

class SpreadGameServer extends SocketServer<
    GameServerMessage,
    ClientMessage<GameClientMessageData>
> {
    connectedPlayers: ConnectedPlayer[]
    state: Lobby | InGame

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        super(port)
        this.connectedPlayers = []

        const lobby = new LobbyImplementation((token, msg) =>
            this.sendMessageToClientViaToken(token, msg),
        )
        this.state = lobby
    }

    sendMessageToClientViaToken(token: string, msg: GameServerMessage) {
        const cp = this.connectedPlayers.find((cp) => cp.token === token)
        if (cp !== undefined) {
            this.sendMessageToClient(cp.socket, msg)
        }
    }

    lobbyToInGame() {
        if (this.state.type === 'lobby' && this.state.map !== null) {
            const inGameState = new InGameImplementation(
                this.state.map,
                this.state.seatedPlayers,
                (msg) => this.sendMessageToClients(msg),
            )
            this.state = inGameState
            this.state.startGame()
            FindGameServerHandler.findGameServer?.updateClients()
        }
        //clearInterval(this.intervalId)
    }

    onReceiveMessage(
        client: WebSocket,
        message: ClientMessage<GameClientMessageData>,
        token: string,
    ) {
        const clientMessage = message.data
        if (
            this.state.type === 'lobby' &&
            isClientLobbyMessage(clientMessage)
        ) {
            if (clientMessage.type === 'startgame') {
                this.lobbyToInGame()
                console.log('game started')
            } else {
                this.state.onReceiveMessage(message.token, clientMessage)
            }
        } else if (
            this.state.type === 'ingame' &&
            !isClientLobbyMessage(clientMessage)
        ) {
            this.state.onReceiveMessage(message.token, clientMessage)
        }
    }

    onConnect(client: WebSocket, token: string) {
        const index = this.connectedPlayers.findIndex(
            (cp) => cp.token === token,
        )
        if (index < 0 && this.state.type === 'lobby') {
            const playerId = this.state.seatPlayer(token)
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
        if (this.state.type === 'lobby') {
            this.state.unseatPlayer(token)
        }
    }

    // data to be displayed on 'open games'-screen
    // TODO rework
    toOpenGame() {
        const url = this.url
        const running = this.state.type === 'ingame'

        let players: number
        let joinedPlayers: number
        if (this.state.type === 'lobby' && this.state.map !== null) {
            const remSeats = this.state.remainingSeats()
            players = this.state.map.players
            joinedPlayers = players - remSeats.length
        } else {
            players = 0
            joinedPlayers = 0
        }
        const res: OpenGame = {
            url: url,
            joinedPlayers: joinedPlayers,
            players: players,
            running: running,
        }
        return res
    }
}

export default SpreadGameServer
