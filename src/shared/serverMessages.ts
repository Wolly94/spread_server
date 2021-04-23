import { ClientGameState } from './clientState'

export interface GameStateMessage {
    type: 'gamestate'
    data: ClientGameState
}

export interface GameOverMessage {
    type: 'gameover'
    data: null
}

type ServerMessage = GameStateMessage | GameOverMessage

export default ServerMessage
