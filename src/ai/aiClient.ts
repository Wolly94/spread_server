import generateToken from '../registration/generateToken'
import { ClientGameState } from '../shared/inGame/clientGameState'
import GameClientMessageData, {
    SendUnitsMessage,
} from '../shared/inGame/gameClientMessages'
import {
    GameStateMessage,
    SetPlayerIdMessage,
} from '../shared/inGame/gameServerMessages'
import { Ai } from './ai'

class AiClient {
    ai: Ai
    playerId: number
    timeoutInterval: number
    currentlyTimedOut: boolean

    constructor(playerId: number, ai: Ai) {
        this.playerId = playerId
        this.ai = ai
        this.timeoutInterval = 500
        this.currentlyTimedOut = false
    }

    getMove(gameState: ClientGameState) {
        if (!this.currentlyTimedOut) {
            const move = this.ai.getMove(gameState, this.playerId)
            if (move !== null) {
                this.currentlyTimedOut = true
                setTimeout(
                    () => (this.currentlyTimedOut = false),
                    this.timeoutInterval,
                )
                return move
            }
        }
        return null
    }
}

export default AiClient
