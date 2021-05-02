import { SpreadMap } from '../game/map'

export interface SendUnits {
    senderIds: number[]
    receiverId: number
}

export interface SendUnitsMessage {
    type: 'sendunits'
    data: SendUnits
}

export interface SetMapMessage {
    type: 'setmap'
    data: SpreadMap
}

export interface StartGameMessage {
    type: 'startgame'
    data: {}
}

type GameClientMessageData = SendUnitsMessage | SetMapMessage | StartGameMessage

export default GameClientMessageData
