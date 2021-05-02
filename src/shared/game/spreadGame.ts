import { ClientGameState } from '../inGame/clientGameState'
import Bubble from './bubble'
import Cell from './cell'
import { SpreadMap } from './map'
import Player from './player'

export class SpreadGame {
    cells: Cell[]
    bubbles: Bubble[]
    players: Player[]

    constructor(map: SpreadMap, players: Player[]) {
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
        this.players = players
    }

    step(ms: number) {
        this.bubbles.forEach((bubble) => bubble.move(ms))
        this.cells.forEach((cell) => cell.grow(ms))
        this.collideBubblesWithCells()
        this.collideBubblesWithBubbles()
    }
    collideBubblesWithBubbles() {
        // let bubbles collide with each other
        var remainingBubbles: Bubble[] = []
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble
            remainingBubbles.filter((bubble2) => {
                if (
                    currentBubble != null &&
                    currentBubble.overlaps(bubble2) &&
                    currentBubble.playerId != bubble2.playerId
                ) {
                    const [survived, newCurrentBubble] = bubble2.collide(
                        currentBubble,
                    )
                    currentBubble = newCurrentBubble
                    return survived
                }
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
                    currentBubble.overlaps(cell) &&
                    (currentBubble.motherId !== cell.id ||
                        currentBubble.playerId !== cell.playerId)
                ) {
                    currentBubble = cell.collide(currentBubble)
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
