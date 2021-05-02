import { ClientCell } from '../inGame/clientGameState'
import Bubble from './bubble'
import Cell from './cell'
import { MapCell } from './map'

export const distanceToEntity = (
    entity: Cell | Bubble | MapCell,
    pos: [number, number],
) => {
    const result = Math.max(
        0,
        Math.sqrt(
            (entity.position[0] - pos[0]) ** 2 +
                (entity.position[1] - pos[1]) ** 2,
        ) - entity.radius,
    )
    return result
}

export const entityContainsPoint = (
    entity: MapCell | ClientCell,
    pos: [number, number],
) => {
    return distanceToEntity(entity, pos) <= 0
}
