import Bubble from './bubble'
import { Cell } from './cell'
import { ClientGameState } from './clientState'

interface Player {
    token: string
    id: number
}

export class SpreadGame {
    cells: Cell[]
    bubbles: Bubble[]
    players: Player[]

    constructor() {
        this.cells = []
        this.bubbles = []
        this.players = []
    }

    step(ms: number) {
        this.bubbles.forEach((bubble) => bubble.move(ms))
        this.cells.forEach((cell) => cell.grow(ms))
        // run through (bubble, cell)
        // only keep bubbles that were not consumed
        this.bubbles.filter((bubble) => {
            this.cells.forEach((cell) => {
                if (!bubble.overlaps(cell)) return true
                if (
                    bubble.motherId == cell.id &&
                    bubble.playerId == cell.playerId
                )
                    return true
                cell.consume(bubble)
                return false
            })
        })
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
    sendUnits(playerToken: string, senderIds: number[], receiverId: number) {
        const player = this.players.find((v) => v.token == playerToken)
        if (player == undefined) return
        const playerId = player.id
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
            const bubble = sender.send(targetCell)
            this.bubbles.push(bubble)
        })
    }
    stringify() {
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
        return JSON.stringify(gs)
    }
}
