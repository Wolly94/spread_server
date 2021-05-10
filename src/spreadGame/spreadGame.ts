import { getPlayerIds, SpreadMap } from '../shared/game/map'
import { ClientGameState } from '../shared/inGame/clientGameState'
import Bubble from './bubble'
import Cell from './cell'
import Player from './player'

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
}

export interface FightModifier {}

export interface SpreadGameMechanics {
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => [Bubble | null, Bubble | null]
    collideCell: (
        bubble: Bubble,
        cell: Cell,
        fightModifier: FightModifier,
    ) => Bubble | null
    collides: (bubble: Bubble, entity: Bubble | Cell) => boolean
}

export type SpreadGame = SpreadGameState &
    SpreadGameFunctions &
    SpreadGameInteraction

export class SpreadGameImplementation implements SpreadGame {
    cells: Cell[]
    bubbles: Bubble[]
    players: Player[]
    mechanics: SpreadGameMechanics

    constructor(map: SpreadMap, gameMechanics: SpreadGameMechanics) {
        const players = getPlayerIds(map)
        this.mechanics = gameMechanics
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
    }

    step(ms: number) {
        this.bubbles.forEach((bubble) => bubble.move(ms))
        this.cells.forEach((cell) => {
            if (cell.playerId !== null) cell.grow(ms)
        })
        this.collideBubblesWithCells()
        this.collideBubblesWithBubbles()
    }
    collideBubblesWithBubbles() {
        var remainingBubbles: Bubble[] = []
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble
            remainingBubbles = remainingBubbles.filter((bubble2) => {
                if (
                    currentBubble != null &&
                    this.mechanics.collides(currentBubble, bubble2)
                ) {
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
                    this.mechanics.collides(currentBubble, cell) &&
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
        if (player == undefined) return
        const targetCell = this.cells.find((c) => c.id == receiverId)
        if (targetCell == undefined) return
        senderIds.forEach((senderId) => {
            const sender = this.cells.find(
                (c) =>
                    c.id == senderId &&
                    c.playerId == playerId &&
                    senderId != receiverId,
            )
            if (sender == undefined) return
            const bubble = sender.trySend(targetCell)
            if (bubble != null) this.bubbles.push(bubble)
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
