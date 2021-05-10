export const distance = (pos1: [number, number], pos2: [number, number]) => {
    return Math.sqrt((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2)
}

export const distanceToEntity = (
    entity: { position: [number, number]; radius: number },
    pos: [number, number],
) => {
    const result = Math.max(0, distance(entity.position, pos) - entity.radius)
    return result
}

export const entityContainsPoint = (
    entity: { position: [number, number]; radius: number },
    pos: [number, number],
) => {
    return distanceToEntity(entity, pos) <= 0
}
