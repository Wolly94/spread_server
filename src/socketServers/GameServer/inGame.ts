import { GreedyAi } from '../../ai/ai'
import AiClient from '../../ai/aiClient'
import { SpreadMap } from '../../shared/game/map'
import { SpreadGame } from '../../shared/game/spreadGame'
import { ClientInGameMessage } from '../../shared/inGame/gameClientMessages'
import GameServerMessage, {
    GameStateMessage,
    ServerInGameMessage,
} from '../../shared/inGame/gameServerMessages'
import { idFromToken, remainingSeats, SeatedPlayer } from './common'

interface InGameState {
    type: 'ingame'
    map: SpreadMap
    seatedPlayers: SeatedPlayer[]
    aiClients: AiClient[] // last reference to these clients, to be deleted when finishing game
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
}

interface InGameFunctions {
    startGame: () => void
    onReceiveMessage: (token: string, message: ClientInGameMessage) => void
}

export type InGame = InGameState & InGameFunctions

class InGameImplementation implements InGame {
    type: 'ingame' = 'ingame'
    map: SpreadMap
    seatedPlayers: SeatedPlayer[]
    aiClients: AiClient[]
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    sendMessage: (msg: ServerInGameMessage) => void

    constructor(
        map: SpreadMap,
        seatedPlayers: SeatedPlayer[],
        sendMessage: (msg: ServerInGameMessage) => void,
        fillWithAi: boolean = true,
    ) {
        this.intervalId = null
        this.map = map
        this.gameState = new SpreadGame(map)
        this.seatedPlayers = seatedPlayers
        this.sendMessage = sendMessage

        if (fillWithAi) {
            const remSeats = remainingSeats(map, seatedPlayers)
            this.aiClients = remSeats.map((playerId) => {
                const ai = new GreedyAi()
                const aiClient = new AiClient(playerId, ai)
                return aiClient
            })
        } else {
            this.aiClients = []
        }
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
            data: data,
        }
        this.sendMessage(message)
        this.aiClients.forEach((aiCl) => {
            const move = aiCl.getMove(data)
            if (move != null) {
                this.gameState.sendUnits(
                    aiCl.playerId,
                    move.data.senderIds,
                    move.data.receiverId,
                )
                console.log('ai sent attack')
            }
        })
    }
}

export default InGameImplementation
