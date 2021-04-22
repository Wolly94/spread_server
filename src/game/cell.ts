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
        const bubble = new Bubble(
            this.playerId,
            this.position,
            [1.0, 0.0],
            attacker,
            this.id,
        )
        return bubble
    }
    consume(other: Bubble) {
        if (this.playerId == other.playerId) {
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
    }
    grow(ms: number) {
        this.units += (this.growthPerSecond * ms) / 1000.0
    }
}

export default Cell
