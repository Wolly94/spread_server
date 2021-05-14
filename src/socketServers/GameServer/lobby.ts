import { ClientLobbyMessage } from 'spread_game/dist/messages/inGame/clientLobbyMessage'
import {
    GameSettings,
    ServerLobbyMessage,
    ClientLobbyPlayer,
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientObserver,
    ClientLobbyState,
    LobbyStateMessage,
    SetPlayerIdMessage,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import GameServerMessage from 'spread_game/dist/messages/replay/serverReplayMessages'
import { SpreadMap, getPlayerIds } from 'spread_game/dist/spreadGame/map/map'
import {
    PlayerData,
    RegisteredToken,
} from '../../registration/registrationHandler'
import FindGameServerHandler from '../findGameServerHandler'
import { AiPlayer, HumanPlayer, remainingSeats, SeatedPlayer } from './common'

interface LobbyState {
    type: 'lobby'
    map: SpreadMap | null
    seatedPlayers: SeatedPlayer[]
    unseatedPlayers: RegisteredToken[]
    gameSettings: GameSettings
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
    gameSettings: GameSettings
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
        this.gameSettings = { mechanics: 'basic' }
        this.seatedPlayers = []
        this.unseatedPlayers = []
        this.sendMessageToClientViaToken = sendMessageToClient
        this.sendMessage = sendMessage
    }

    onReceiveMessage(token: string, message: ClientLobbyMessage) {
        if (message.type === 'setmap') {
            const value = message.data
            this.setMap(token, value)
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
        } else if (message.type === 'gamesettings') {
            this.gameSettings = message.data
            this.updateClients()
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
            gameSettings: this.gameSettings,
        }
        const msg: LobbyStateMessage = {
            type: 'lobbystate',
            data: state,
        }
        this.sendMessage(msg)
        FindGameServerHandler.findGameServer?.updateClients()
    }

    clearAiSeat(playerId: number): AiPlayer | null {
        let seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.playerId === playerId,
        )
        if (seatedIndex >= 0) {
            if (this.seatedPlayers[seatedIndex].type === 'ai') {
                const ai = this.seatedPlayers.splice(seatedIndex, 1)[0]
                // to make compiler happy:
                if (ai.type === 'ai') return ai
                else return null
            }
        }
        return null
    }

    takeSeat(token: string, playerId: number) {
        const ai = this.clearAiSeat(playerId)

        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === 'human' && sp.token === token,
        )
        const unseatedIndex = this.unseatedPlayers.findIndex(
            (usp) => usp.token === token,
        )
        if (seatedIndex < 0 && unseatedIndex < 0) {
            return
        } else if (seatedIndex >= 0) {
            if (ai !== null) {
                ai.playerId = this.seatedPlayers[seatedIndex].playerId
                this.seatedPlayers[seatedIndex].playerId = playerId
                this.seatedPlayers.push(ai)
            } else {
                this.seatedPlayers[seatedIndex].playerId = playerId
            }
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
        this.clearAiSeat(playerId)
        this.updateClients()
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

    setMap(token: string, map: SpreadMap) {
        this.map = map
        const currentlySeated = [...this.seatedPlayers]
        this.unseatedPlayers.push(
            ...this.seatedPlayers
                .filter((sp): sp is HumanPlayer => sp.type === 'human')
                .map((sp) => {
                    return { playerData: sp.playerData, token: sp.token }
                }),
        )
        this.seatedPlayers = []
        currentlySeated.forEach((sp) => {
            if (sp.type === 'human') this.seatPlayer(sp.token)
        })
        const playerIds = getPlayerIds(map)
        const openIds = Array.from(playerIds).filter(
            (pid) => !this.seatedPlayers.some((sp) => sp.playerId === pid),
        )
        if (openIds.length === playerIds.size) {
            this.seatPlayer(token)
        }
        openIds.forEach((pid) => this.seatAi(token, pid))
        this.updateClients()
    }
}

export default LobbyImplementation
