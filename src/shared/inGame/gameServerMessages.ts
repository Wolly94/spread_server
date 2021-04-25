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

type GameServerMessage = GameStateMessage | SetPlayerIdMessage | GameOverMessage

export default GameServerMessage
