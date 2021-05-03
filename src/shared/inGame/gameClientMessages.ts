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

export type ClientLobbyMessage = SetMapMessage | StartGameMessage
export type ClientInGameMessage = SendUnitsMessage

type GameClientMessageData = ClientLobbyMessage | ClientInGameMessage

export const isClientLobbyMessage = (
    msg: GameClientMessageData,
): msg is ClientLobbyMessage => {
    return !(msg.type === 'sendunits')
}

export default GameClientMessageData
