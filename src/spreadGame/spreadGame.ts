import { getPlayerIds, SpreadMap } from '../shared/game/map'
import { ClientGameState } from '../shared/inGame/clientGameState'
import { GameSettings } from '../shared/inGame/gameServerMessages'
import SpreadReplay, { HistoryEntry, Move } from '../shared/replay/replay'
import Bubble from './bubble'
import Cell from './cell'
import basicMechanics from './mechanics/basicMechanics'
import bounceMechanics from './mechanics/bounceMechanics'
import { SpreadGameMechanics } from './mechanics/commonMechanics'
import scrapeOffMechanics from './mechanics/scrapeOffMechanics'
import Player from './player'

const getMechanics = (settings: GameSettings): SpreadGameMechanics => {
    if (settings.mechanics === 'basic') {
        return basicMechanics
    } else if (settings.mechanics === 'scrapeoff') {
        return scrapeOffMechanics
    } else if (settings.mechanics === 'bounce') {
        return bounceMechanics
    } else throw Error('unregistered mechanics')
}

export interface SpreadGameState {
    cells: Cell[]
    bubbles: Bubble[]
    players: Player[]
}

export interface SpreadGameInteraction {
    sendUnits: (
        playerId: number,
        senderIds: number[],
        receiverId: number,
    ) => void
}

export interface SpreadGameFunctions {
    step: (ms: number) => void
    toClientGameState: () => ClientGameState
    getReplay: () => SpreadReplay
}

export interface FightModifier {}

export type SpreadGame = SpreadGameState &
    SpreadGameFunctions &
    SpreadGameInteraction

export class SpreadGameImplementation implements SpreadGame {
    map: SpreadMap
    gameSettings: GameSettings
    cells: Cell[]
    bubbles: Bubble[]
    players: Player[]
    pastMoves: HistoryEntry<Move>[]
    mechanics: SpreadGameMechanics
    timePassed: number

    constructor(map: SpreadMap, gameSettings: GameSettings) {
        const players = getPlayerIds(map)
        this.gameSettings = gameSettings
        this.mechanics = getMechanics(gameSettings)
        this.map = map
        this.cells = map.cells.map((mapCell) => {
            const cell: Cell = new Cell(
                mapCell.id,
                mapCell.playerId,
                mapCell.position,
                mapCell.units,
                mapCell.radius,
            )
            return cell
        })
        this.bubbles = []
        this.players = Array.from(players).map((id) => {
            return { id: id }
        })
        this.timePassed = 0
        this.pastMoves = []
    }

    getReplay() {
        const rep: SpreadReplay = {
            map: this.map,
            gameSettings: this.gameSettings,
            moveHistory: this.pastMoves,
            players: this.players,
        }
        return rep
    }

    step(ms: number) {
        this.bubbles.map((bubble) => this.mechanics.move(bubble, ms))
        this.cells.forEach((cell) => {
            if (cell.playerId !== null) cell.grow(ms)
        })
        this.collideBubblesWithCells()
        this.collideBubblesWithBubbles()
        this.timePassed += ms
    }

    collideBubblesWithBubbles() {
        var remainingBubbles: Bubble[] = []
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble
            remainingBubbles = remainingBubbles.filter((bubble2) => {
                if (currentBubble != null) {
                    const [rem1, rem2] = this.mechanics.collideBubble(
                        bubble2,
                        currentBubble,
                        {},
                    )
                    currentBubble = rem2
                    return rem1 !== null
                } else return true
            })
            if (currentBubble != null) {
                remainingBubbles.push(currentBubble)
            }
        })
        this.bubbles = remainingBubbles
    }
    collideBubblesWithCells() {
        var remainingBubbles: Bubble[] = []
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble
            this.cells.forEach((cell) => {
                if (
                    currentBubble != null &&
                    (currentBubble.motherId !== cell.id ||
                        currentBubble.playerId !== cell.playerId)
                ) {
                    currentBubble = this.mechanics.collideCell(
                        currentBubble,
                        cell,
                        {},
                    )
                }
            })
            if (currentBubble != null) {
                remainingBubbles.push(currentBubble)
            }
        })
        this.bubbles = remainingBubbles
    }
    sendUnits(playerId: number, senderIds: number[], receiverId: number) {
        const player = this.players.find((p) => p.id == playerId)
        if (player == undefined) return false
        const targetCell = this.cells.find((c) => c.id == receiverId)
        if (targetCell == undefined) return false
        const sentIds = senderIds.filter((senderId) => {
            const sender = this.cells.find(
                (c) =>
                    c.id == senderId &&
                    c.playerId == playerId &&
                    senderId != receiverId,
            )
            if (sender == undefined) return false
            const bubble = sender.trySend(targetCell)
            if (bubble != null) {
                this.bubbles.push(bubble)
                return true
            } else {
                return false
            }
        })
        this.pastMoves.push({
            timestamp: this.timePassed,
            data: {
                type: 'sendunits',
                data: {
                    receiverId: targetCell.id,
                    senderIds: sentIds,
                },
            },
        })
    }

    toClientGameState() {
        const gs: ClientGameState = {
            cells: this.cells.map((cell) => {
                return {
                    id: cell.id,
                    playerId: cell.playerId,
                    units: cell.units,
                    position: cell.position,
                    radius: cell.radius,
                }
            }),
            bubbles: this.bubbles.map((bubble) => {
                return {
                    id: bubble.id,
                    playerId: bubble.playerId,
                    units: bubble.units,
                    position: bubble.position,
                    radius: bubble.radius,
                }
            }),
        }
        return gs
    }
}
