export interface JoinGameMessage {
    type: 'joingame'
    data: {
        gameId: number
    }
}

type FindGameClientMessage = JoinGameMessage

export default FindGameClientMessage
