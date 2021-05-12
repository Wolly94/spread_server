import { GreedyAi } from '../../ai/ai'
import AiClient from '../../ai/aiClient'
import { PlayerData } from '../../registration/registrationHandler'
import { SpreadMap } from '../../shared/game/map'
import { ClientInGameMessage } from '../../shared/inGame/clientInGameMessage'
import GameServerMessage, {
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientLobbyPlayer,
    ClientObserver,
    GameSettings,
    LobbyStateMessage,
    ServerInGameMessage,
    SetPlayerIdMessage,
} from '../../shared/inGame/gameServerMessages'
import basicMechanics from '../../spreadGame/mechanics/basicMechanics'
import bounceMechanics from '../../spreadGame/mechanics/bounceMechanics'
import scrapeOffMechanics from '../../spreadGame/mechanics/scrapeOffMechanics'
import {
    SpreadGame,
    SpreadGameImplementation,
} from '../../spreadGame/spreadGame'
import { AiPlayer, idFromToken, SeatedPlayer } from './common'

const updateFrequencyInMs = 20

interface InGameState {
    type: 'ingame'
    map: SpreadMap
    gameSettings: GameSettings
    seatedPlayers: SeatedPlayer[]
    aiClients: AiClient[] // last reference to these clients, to be deleted when finishing game
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
}

interface InGameFunctions {
    startGame: () => void
    stop: () => void
    onReceiveMessage: (token: string, message: ClientInGameMessage) => void
    onConnect: (token: string, playerData: PlayerData) => void
}

export type InGame = InGameState & InGameFunctions

class InGameImplementation implements InGame {
    type: 'ingame' = 'ingame'
    map: SpreadMap
    gameSettings: GameSettings
    seatedPlayers: SeatedPlayer[]
    aiClients: AiClient[]
    gameState: SpreadGame
    intervalId: NodeJS.Timeout | null
    sendMessageToClientViaToken: (
        token: string,
        message: GameServerMessage,
    ) => void
    sendMessage: (msg: ServerInGameMessage) => void

    constructor(
        map: SpreadMap,
        settings: GameSettings,
        seatedPlayers: SeatedPlayer[],
        sendMessageToClient: (
            token: string,
            message: GameServerMessage,
        ) => void,
        sendMessage: (msg: ServerInGameMessage) => void,
    ) {
        this.intervalId = null
        this.map = map
        this.gameSettings = settings
        if (settings.mechanics === 'basic') {
            this.gameState = new SpreadGameImplementation(map, basicMechanics)
        } else if (settings.mechanics === 'scrapeoff') {
            this.gameState = new SpreadGameImplementation(
                map,
                scrapeOffMechanics,
            )
        } else if (settings.mechanics === 'bounce') {
            this.gameState = new SpreadGameImplementation(map, bounceMechanics)
        } else throw Error('unregistered mechanics')
        this.seatedPlayers = seatedPlayers
        this.sendMessageToClientViaToken = sendMessageToClient
        this.sendMessage = sendMessage

        this.aiClients = this.seatedPlayers
            .filter((sp): sp is AiPlayer => {
                return sp.type === 'ai'
            })
            .map((sp) => {
                const ai = new GreedyAi()
                const aiClient = new AiClient(sp.playerId, ai)
                return aiClient
            })
    }

    isRunning() {
        return this.intervalId !== null
    }

    stop() {
        if (this.intervalId !== null) clearInterval(this.intervalId)
    }

    onConnect(token: string, playerData: PlayerData) {
        const index = this.seatedPlayers.findIndex(
            (sp) => sp.type === 'human' && sp.token === token,
        )
        const playerIdMessage: SetPlayerIdMessage = {
            type: 'playerid',
            data: {
                playerId:
                    index >= 0 ? this.seatedPlayers[index].playerId : null,
            },
        }
        this.sendMessageToClientViaToken(token, playerIdMessage)
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
        const observers: ClientObserver[] = []
        const lobbyStateMessage: LobbyStateMessage = {
            type: 'lobbystate',
            data: {
                map: this.map,
                players: players,
                observers: observers,
                gameSettings: this.gameSettings,
            },
        }
        this.sendMessageToClientViaToken(token, lobbyStateMessage)
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
        const ms = updateFrequencyInMs
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
