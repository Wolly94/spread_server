import { SpreadMap } from '../game/map'
import { SendUnitsMessage } from '../inGame/clientInGameMessage'

export type Move = SendUnitsMessage

interface SpreadReplay {
    map: SpreadMap
    moveHistory: Move[]
}

export default SpreadReplay
