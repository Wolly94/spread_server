import Bubble from './bubble'

var idCounter = 0

class Cell {
    id: number
    playerId: number | null
    position: [number, number]
    radius: number
    units: number
    growthPerSecond: number
    constructor(
        playerId: number,
        position: [number, number],
        units: number,
        radius: number,
    ) {
        idCounter += 1
        this.id = idCounter
        this.playerId = playerId
        this.position = position
        this.units = units
        this.radius = radius
        this.growthPerSecond = 1.0
    }
    trySend(target: Cell): Bubble | null {
        if (this.playerId == null) return null
        const attacker = Math.floor(this.units / 2)
        this.units -= attacker
        var direction = [
            target.position[0] - this.position[0],
            target.position[1] - this.position[1],
        ]
        const dist = Math.sqrt(direction[0] ** 2 + direction[1] ** 2)
        if (dist === 0) return null
        const lambda = this.radius / dist
        const normedDirection: [number, number] = [
            direction[0] / dist,
            direction[1] / dist,
        ]
        const position: [number, number] = [
            this.position[0] + lambda * direction[0],
            this.position[1] + lambda * direction[1],
        ]
        const bubble = new Bubble(
            this.playerId,
            position,
            normedDirection,
            attacker,
            this.id,
        )
        return bubble
    }
    collide(other: Bubble): Bubble | null {
        if (this.playerId === other.playerId) {
            this.units += other.units
        } else {
            const result = this.units - other.units
            if (result >= 0) {
                this.units = result
            } else {
                this.units = -result
                this.playerId = other.playerId
            }
        }
        return null
    }
    grow(ms: number) {
        this.units += (this.growthPerSecond * ms) / 1000.0
    }
}

export default Cell
