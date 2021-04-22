export interface ClientBubble {
    id: number
    units: number
    position: [number, number]
    playerId: number
    radius: number
}
export interface ClientCell {
    id: number
    units: number
    position: [number, number]
    playerId: number | null
    radius: number
}

export interface ClientGameState {
    cells: ClientCell[]
    bubbles: ClientBubble[]
}
