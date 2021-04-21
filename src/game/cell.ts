import Bubble from './bubble'

export class Cell {
    id: number
    playerId: number
    position: [number, number]
    radius: number
    units: number
    growthPerSecond: number
    constructor() {
        this.id = 1
        this.playerId = 1
        this.position = [100, 200]
        this.units = 100.0
        this.radius = 50.0
        this.growthPerSecond = 1.0
    }
    send(target: Cell): Bubble {
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
