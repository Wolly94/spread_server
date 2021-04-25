export interface OpenGame {
    url: string
    players: number
    joinedPlayers: number
    running: boolean
}

export interface OpenGamesMessage {
    type: 'opengames'
    data: OpenGame[]
}

type FindGameServerMessage = OpenGamesMessage

export default FindGameServerMessage
