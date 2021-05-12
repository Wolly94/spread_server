import { SpreadMap } from '../game/map'
import { SendUnitsMessage } from '../inGame/clientInGameMessage'
import { GameSettings } from '../inGame/gameServerMessages'

export type Move = SendUnitsMessage

export interface HistoryEntry<T> {
    timestamp: number
    data: T
}

interface SpreadReplay {
    map: SpreadMap
    gameSettings: GameSettings
    moveHistory: HistoryEntry<Move>[]
}

export default SpreadReplay
