import {
    PlayerData,
    RegisteredToken,
} from '../../registration/registrationHandler'
import { SpreadMap } from '../../shared/game/map'
import { ClientLobbyMessage } from '../../shared/inGame/clientLobbyMessage'
import GameServerMessage, {
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientLobbyPlayer,
    ClientLobbyState,
    ClientObserver,
    LobbyStateMessage,
    ServerLobbyMessage,
    SetPlayerIdMessage,
} from '../../shared/inGame/gameServerMessages'
import FindGameServerHandler from '../findGameServerHandler'
import { AiPlayer, remainingSeats, SeatedPlayer } from './common'

interface LobbyState {
    type: 'lobby'
    map: SpreadMap | null
    seatedPlayers: SeatedPlayer[]
    unseatedPlayers: RegisteredToken[]
}

interface LobbyFunctions {
    unseatPlayer: (token: string) => void
    onReceiveMessage: (token: string, msg: ClientLobbyMessage) => void
    remainingLobbySeats: () => number[]
    onConnect: (token: string, playerData: PlayerData) => void
}

export type Lobby = LobbyState & LobbyFunctions

class LobbyImplementation implements Lobby {
    type: 'lobby' = 'lobby'
    map: SpreadMap | null
    seatedPlayers: SeatedPlayer[]
    unseatedPlayers: RegisteredToken[]
    sendMessageToClientViaToken: (
        token: string,
        message: GameServerMessage,
    ) => void
    sendMessage: (msg: ServerLobbyMessage) => void

    constructor(
        sendMessageToClient: (
            token: string,
            message: GameServerMessage,
        ) => void,
        sendMessage: (msg: ServerLobbyMessage) => void,
    ) {
        this.map = null
        this.seatedPlayers = []
        this.unseatedPlayers = []
        this.sendMessageToClientViaToken = sendMessageToClient
        this.sendMessage = sendMessage
    }

    onReceiveMessage(token: string, message: ClientLobbyMessage) {
        if (message.type === 'setmap') {
            const value = message.data
            this.setMap(value)
            this.seatPlayer(token)
            console.log('map successfully set')
        } else if (message.type === 'takeseat') {
            const playerId = message.data.playerId
            this.takeSeat(token, playerId)
        } else if (message.type === 'clearseat') {
            const playerId = message.data.playerId
            this.clearSeat(token, playerId)
        } else if (message.type === 'seatai') {
            const playerId = message.data.playerId
            this.seatAi(token, playerId)
        }
    }

    updateClients() {
        // later add list of unseatedPlayers to lobby and inGame to let them also be displayed on website
        const players: ClientLobbyPlayer[] = this.seatedPlayers.map((sp) => {
            if (sp.type === 'ai') {
                const aip: ClientAiPlayer = {
                    type: 'ai',
                    playerId: sp.playerId,
                }
                return aip
            } else {
                const clp: ClientHumanPlayer = {
                    type: 'human',
                    name: sp.playerData.name,
                    playerId: sp.playerId,
                }
                return clp
            }
        })
        const observers: ClientObserver[] = this.unseatedPlayers.map((usp) => {
            return { name: usp.playerData.name }
        })
        const state: ClientLobbyState = {
            map: this.map,
            players,
            observers: observers,
        }
        const msg: LobbyStateMessage = {
            type: 'lobbystate',
            data: state,
        }
        this.sendMessage(msg)
        FindGameServerHandler.findGameServer?.updateClients()
    }

    takeSeat(token: string, playerId: number) {
        const alreadyOccupied = this.seatedPlayers.some(
            (sp) => sp.playerId === playerId && sp.type === 'human',
        )
        if (alreadyOccupied) return

        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === 'human' && sp.token === token,
        )
        const unseatedIndex = this.unseatedPlayers.findIndex(
            (usp) => usp.token === token,
        )
        if (seatedIndex < 0 && unseatedIndex < 0) {
            return
        } else if (seatedIndex >= 0) {
            this.seatedPlayers[seatedIndex].playerId = playerId
        } else if (unseatedIndex >= 0) {
            this.seatedPlayers.push({
                type: 'human',
                token: token,
                playerId: playerId,
                playerData: this.unseatedPlayers[unseatedIndex].playerData,
            })
        }
        const setPlayerIdMessage: SetPlayerIdMessage = {
            type: 'playerid',
            data: {
                playerId: playerId,
            },
        }
        this.sendMessageToClientViaToken(token, setPlayerIdMessage)
        this.updateClients()
    }

    clearSeat(token: string, playerId: number) {
        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.playerId === playerId,
        )
        if (seatedIndex >= 0 && this.seatedPlayers[seatedIndex].type === 'ai') {
            this.seatedPlayers.splice(seatedIndex, 1)
            this.updateClients()
        }
    }

    seatAi(token: string, playerId: number) {
        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.playerId === playerId,
        )
        if (seatedIndex < 0) {
            const ai: AiPlayer = {
                playerId: playerId,
                type: 'ai',
            }
            this.seatedPlayers.push(ai)
            this.updateClients()
        }
    }

    seatPlayer(token: string) {
        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === 'human' && sp.token === token,
        )
        if (seatedIndex >= 0) return null
        const unseatedIndex = this.unseatedPlayers.findIndex(
            (usp) => usp.token === token,
        )
        if (unseatedIndex < 0) return null

        const remSeats = this.remainingLobbySeats()
        if (remSeats.length === 0) return null
        const playerId = remSeats[0]
        const newSeated: SeatedPlayer = {
            type: 'human',
            playerId: playerId,
            token: token,
            playerData: this.unseatedPlayers[unseatedIndex].playerData,
        }
        this.seatedPlayers.push(newSeated)
        this.unseatedPlayers.splice(unseatedIndex, 1)
        const message: SetPlayerIdMessage = {
            type: 'playerid',
            data: {
                playerId: playerId,
            },
        }
        this.sendMessageToClientViaToken(newSeated.token, message)
        this.updateClients()
        return playerId
    }

    unseatPlayer(token: string) {
        const index = this.seatedPlayers.findIndex(
            (sp) => sp.type === 'human' && sp.token === token,
        )
        if (index >= 0) {
            const sp = this.seatedPlayers[index]
            if (sp.type === 'human')
                this.unseatedPlayers.push({
                    token: token,
                    playerData: sp.playerData,
                })
            this.seatedPlayers = this.seatedPlayers.splice(index, 1)
        }
        this.updateClients()
    }

    remainingLobbySeats() {
        if (this.map === null) {
            return []
        }
        return remainingSeats(this.map, this.seatedPlayers)
    }

    onConnect(token: string, playerData: PlayerData) {
        this.unseatedPlayers.push({ token: token, playerData: playerData })
        const playerId = this.seatPlayer(token)
    }

    setMap(map: SpreadMap) {
        const currentlySeated = [...this.seatedPlayers]
        this.seatedPlayers = []
        currentlySeated.forEach((sp) => {
            if (sp.type === 'human') this.seatPlayer(sp.token)
        })
        this.map = map
        this.updateClients()
    }
}

export default LobbyImplementation
