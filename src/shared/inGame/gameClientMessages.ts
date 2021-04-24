export interface SendUnits {
    senderIds: number[]
    receiverId: number
}

export interface SendUnitsMessage {
    type: 'sendunits'
    data: SendUnits
}

type GameClientMessageData = SendUnitsMessage

export default GameClientMessageData
