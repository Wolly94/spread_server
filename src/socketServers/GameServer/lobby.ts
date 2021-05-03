import { getPlayerIds, SpreadMap } from '../../shared/game/map'
import GameServerMessage, {
    ClientLobbyPlayer,
    ClientLobbyState,
    LobbyStateMessage,
    ServerLobbyMessage,
    SetPlayerIdMessage,
} from '../../shared/inGame/gameServerMessages'
import { occupiedSeats, SeatedPlayer } from './common'

import WebSocket from 'ws'
import FindGameServerHandler from '../findGameServerHandler'
import { ClientLobbyMessage } from '../../shared/inGame/gameClientMessages'
import {
    getPlayerData,
    PlayerData,
} from '../../registration/registrationHandler'

interface LobbyState {
    type: 'lobby'
    map: SpreadMap | null
    seatedPlayers: SeatedPlayer[]
}

interface LobbyFunctions {
    seatPlayer: (token: string, playerData: PlayerData) => number | null
    unseatPlayer: (token: string) => void
    onReceiveMessage: (token: string, msg: ClientLobbyMessage) => void
    remainingSeats: () => number[]
}

export type Lobby = LobbyState & LobbyFunctions

class LobbyImplementation implements Lobby {
    type: 'lobby'
    map: SpreadMap | null
    seatedPlayers: SeatedPlayer[]
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
        this.sendMessageToClientViaToken = sendMessageToClient
        this.sendMessage = sendMessage
    }

    onReceiveMessage(token: string, message: ClientLobbyMessage) {
        if (message.type === 'setmap') {
            const value = message.data
            this.setMap(value)
            console.log('map successfully set')
        }
    }

    updateClients() {
        // later add list of unseatedPlayers to lobby and inGame to let them also be displayed on website
        const players: ClientLobbyPlayer[] = this.seatedPlayers.map((sp) => {
            const clp: ClientLobbyPlayer = {
                name: sp.playerData.name,
                playerId: sp.playerId,
            }
            return clp
        })
        const state: ClientLobbyState = {
            map: this.map,
            players,
        }
        const msg: LobbyStateMessage = {
            type: 'lobbystate',
            data: state,
        }
        this.sendMessage(msg)
    }

    seatPlayer(token: string, playerData: PlayerData) {
        const remSeats = this.remainingSeats()
        if (remSeats.length === 0) return null
        const playerId = remSeats[0]
        const newSeated: SeatedPlayer = {
            playerId: playerId,
            token: token,
            playerData: playerData,
        }
        this.seatedPlayers.push(newSeated)
        const message: SetPlayerIdMessage = {
            type: 'playerid',
            data: {
                playerId: playerId,
            },
        }
        this.sendMessageToClientViaToken(newSeated.token, message)
        this.updateClients()
        FindGameServerHandler.findGameServer?.updateClients()
        return playerId
    }

    unseatPlayer(token: string) {
        const index = this.seatedPlayers.findIndex((sp) => sp.token === token)
        if (index >= 0) {
            this.seatedPlayers = this.seatedPlayers.splice(index, 1)
        }
        this.updateClients()
        FindGameServerHandler.findGameServer?.updateClients()
    }

    remainingSeats() {
        if (this.map === null) {
            return []
        }
        const seats = getPlayerIds(this.map)
        const occSeats = occupiedSeats(this.seatedPlayers)
        const remainingSeats = Array.from(seats).filter(
            (id) => !occSeats.includes(id),
        )
        return remainingSeats.sort((a, b) => a - b)
    }

    setMap(map: SpreadMap) {
        const currentlySeated = [...this.seatedPlayers]
        this.seatedPlayers = []
        currentlySeated.forEach((sp) =>
            this.seatPlayer(sp.token, sp.playerData),
        )
        this.map = map
        this.updateClients()
        FindGameServerHandler.findGameServer?.updateClients()
    }
}

export default LobbyImplementation
