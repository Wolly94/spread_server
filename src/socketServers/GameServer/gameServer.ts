import WebSocket from 'ws'
import {
    getPlayerData,
    PlayerData,
} from '../../registration/registrationHandler'
import ClientMessage from '../../shared/clientMessage'
import { OpenGame } from '../../shared/findGame/findGameServerMessages'
import GameClientMessageData, {
    isClientLobbyMessage,
} from '../../shared/inGame/gameClientMessages'
import GameServerMessage from '../../shared/inGame/gameServerMessages'
import FindGameServerHandler from '../findGameServerHandler'
import GameServerHandler from '../gameServerHandler'
import SocketServer from '../socketServer'
import InGameImplementation, { InGame } from './inGame'
import LobbyImplementation, { Lobby } from './lobby'

interface ConnectedPlayer {
    token: string
    socket: WebSocket
    playerData: PlayerData
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

        const lobby = new LobbyImplementation(
            (token, msg) => this.sendMessageToClientViaToken(token, msg),
            (msg) => this.sendMessageToClients(msg),
        )
        this.state = lobby
    }

    shutdown() {
        if (this.state.type === 'ingame') {
            this.state.stop()
        }
        this.socket.close()
        console.log('shutdown game at port ' + this.port.toString())
    }

    sendMessageToClientViaToken(token: string, msg: GameServerMessage) {
        const cp = this.connectedPlayers.find((cp) => cp.token === token)
        if (cp !== undefined) {
            this.sendMessageToClient(cp.socket, msg)
        }
    }

    lobbyToInGame() {
        if (this.state.type === 'lobby' && this.state.map !== null) {
            // maybe clients were created faster than they could be added to the game
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
        if (index >= 0) {
            this.connectedPlayers[index].socket = client
            return
        }
        if (this.state.type === 'lobby') {
            if (index < 0) {
                const playerData = getPlayerData(token)
                if (playerData === null) return
                this.connectedPlayers.push({
                    playerData: playerData,
                    token: token,
                    socket: client,
                })
                this.state.onConnect(token, playerData)
            } else {
                this.state.onConnect(
                    token,
                    this.connectedPlayers[index].playerData,
                )
            }
        }
    }

    onDisconnect(client: WebSocket, token: string) {
        if (this.state.type === 'lobby') {
            this.state.unseatPlayer(token)
        }
        if (this.socket.clients.size === 0) {
            GameServerHandler.shutDown(this.port)
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
            const remSeats = this.state.remainingLobbySeats()
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
