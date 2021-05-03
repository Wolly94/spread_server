import { SpreadMap } from '../../shared/game/map'
import { SpreadGame } from '../../shared/game/spreadGame'
import { ClientInGameMessage } from '../../shared/inGame/gameClientMessages'
import GameServerMessage, {
    GameStateMessage,
    ServerInGameMessage,
} from '../../shared/inGame/gameServerMessages'
import { idFromToken, SeatedPlayer } from './common'

interface InGameState {
    type: 'ingame'
    map: SpreadMap
    seatedPlayers: SeatedPlayer[]
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
}

interface InGameFunctions {
    startGame: () => void
    onReceiveMessage: (token: string, message: ClientInGameMessage) => void
}

export type InGame = InGameState & InGameFunctions

class InGameImplementation implements InGame {
    type: 'ingame'
    map: SpreadMap
    seatedPlayers: SeatedPlayer[]
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    sendMessage: (msg: ServerInGameMessage) => void

    constructor(
        map: SpreadMap,
        seatedPlayers: SeatedPlayer[],
        sendMessage: (msg: ServerInGameMessage) => void,
    ) {
        this.intervalId = null
        this.map = map
        this.gameState = new SpreadGame(map)
        this.seatedPlayers = seatedPlayers
        this.sendMessage = sendMessage
    }

    isRunning() {
        return this.intervalId !== null
    }

    onReceiveMessage(token: string, message: ClientInGameMessage) {
        if (message.type === 'sendunits' && this.isRunning()) {
            const playerId = idFromToken(token, this.seatedPlayers)
            if (playerId != null) {
                const value = message.data
                this.gameState.sendUnits(
                    playerId,
                    value.senderIds,
                    value.receiverId,
                )
                console.log('message received and attack sent: ' + message)
            }
        }
    }

    startGame() {
        const ms = 50
        this.intervalId = setInterval(() => {
            if (this.gameState !== null) {
                this.gameState.step(ms)
                this.updateClients()
            }
        }, ms)
    }

    updateClients() {
        const data = this.gameState.toClientGameState()
        const message: GameServerMessage = {
            type: 'gamestate',
            data: this.gameState,
        }
        this.sendMessage(message)
    }
}

export default InGameImplementation
