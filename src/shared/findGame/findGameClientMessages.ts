export interface JoinGameMessageData {
    type: 'joingame'
    data: {
        gameId: number
    }
}

type FindGameClientMessageData = JoinGameMessageData

export default FindGameClientMessageData
