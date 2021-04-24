import { ClientGameState } from './clientGameState'

export interface GameStateMessage {
    type: 'gamestate'
    data: ClientGameState
}

export interface GameOverMessage {
    type: 'gameover'
    data: null
}

type GameServerMessage = GameStateMessage | GameOverMessage

export default GameServerMessage
