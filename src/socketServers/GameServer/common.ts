export interface SeatedPlayer {
    token: string
    playerId: number
}

export const occupiedSeats = (seatedPlayers: SeatedPlayer[]) => {
    return seatedPlayers.map((sp) => sp.playerId)
}

export const idFromToken = (token: string, seatedPlayers: SeatedPlayer[]) => {
    const sp = seatedPlayers.find((sp) => sp.token === token)
    if (sp !== undefined) return sp.playerId
    else return null
}
