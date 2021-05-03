import { SpreadMap } from '../game/map'
import { ClientGameState } from './clientGameState'

export interface SetPlayerIdMessage {
    type: 'playerid'
    data: {
        playerId: number
    }
}

export interface ClientLobbyPlayer {
    name: string
    playerId: number | null
}

export interface ClientLobbyState {
    players: ClientLobbyPlayer[]
    map: SpreadMap | null
}

export interface LobbyStateMessage {
    type: 'lobbystate'
    data: ClientLobbyState
}

export interface GameStateMessage {
    type: 'gamestate'
    data: ClientGameState
}

export interface GameOverMessage {
    type: 'gameover'
    data: null
}

export type ServerLobbyMessage = SetPlayerIdMessage | LobbyStateMessage
export type ServerInGameMessage = GameStateMessage | GameOverMessage

type GameServerMessage = ServerLobbyMessage | ServerInGameMessage

export const isServerLobbyMessage = (
    msg: GameServerMessage,
): msg is ServerLobbyMessage => {
    return msg.type === 'lobbystate' || msg.type === 'playerid'
}

export default GameServerMessage
