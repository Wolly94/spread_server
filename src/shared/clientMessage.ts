interface ClientMessage<TMessageData> {
    token: string
    data: TMessageData
}

export default ClientMessage
