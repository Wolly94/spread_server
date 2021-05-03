import { ClientGameState } from './clientGameState'

export interface GameStateMessage {
    type: 'gamestate'
    data: ClientGameState
}

export interface SetPlayerIdMessage {
    type: 'playerid'
    data: {
        playerId: number
    }
}

export interface GameOverMessage {
    type: 'gameover'
    data: null
}

export type ServerLobbyMessage = SetPlayerIdMessage
export type ServerInGameMessage = GameStateMessage | GameOverMessage

type GameServerMessage = ServerLobbyMessage | ServerInGameMessage

export default GameServerMessage
