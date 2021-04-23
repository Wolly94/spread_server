export interface SendUnits {
    senderIds: number[]
    receiverId: number
}

export interface SendUnitsMessage {
    type: 'sendunits'
    data: SendUnits
}

export type ClientMessageData = SendUnitsMessage

type ClientMessage = {
    data: ClientMessageData
    token: string
}

export default ClientMessage
