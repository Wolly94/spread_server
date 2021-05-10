import { radiusToGrowth, radiusToUnits } from '../shared/game/common'
import Bubble from './bubble'

class Cell {
    id: number
    playerId: number | null
    position: [number, number]
    radius: number
    units: number
    growthPerSecond: number
    saturatedUnitCount: number

    constructor(
        id: number,
        playerId: number | null,
        position: [number, number],
        units: number,
        radius: number,
    ) {
        this.id = id
        this.playerId = playerId
        this.position = position
        this.units = units
        this.radius = radius
        this.growthPerSecond = radiusToGrowth(radius)
        this.saturatedUnitCount = radiusToUnits(radius)
    }

    availableAttackers() {
        const attacker = Math.floor(this.units / 2)
        return attacker
    }

    trySend(target: Cell): Bubble | null {
        if (this.playerId == null) return null
        const attacker = this.availableAttackers()
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
    grow(ms: number) {
        const sign = this.units > this.saturatedUnitCount ? -1 : 1
        let nextUnits = this.units + (sign * (this.growthPerSecond * ms)) / 1000
        if (
            (nextUnits > this.saturatedUnitCount && sign === 1) ||
            (nextUnits < this.saturatedUnitCount && sign === -1)
        ) {
            this.units = this.saturatedUnitCount
        } else {
            this.units = nextUnits
        }
    }
}

export default Cell
