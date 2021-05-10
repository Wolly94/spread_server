// units ~ radius^2 where 50 ~ 50
export const radiusToUnitsFixPoint = 50
export const radiusToUnits = (radius: number) => {
    if (radius <= 0) return 0
    return radius ** 2 / radiusToUnitsFixPoint
}

export const unitsToRadius = (units: number) => {
    if (units <= 0) return 0
    return Math.sqrt(units * radiusToUnitsFixPoint)
}

// radius ~ units/second
// 50 ~ 1
const unitGrowthRadius = 50
export const radiusToGrowth = (radius: number) => {
    return radius / unitGrowthRadius
}
