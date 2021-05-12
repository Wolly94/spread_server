import SpreadReplay from './replay'

export interface SendReplayMessage {
    type: 'sendreplay'
    data: SpreadReplay
}

type GameServerMessage = SendReplayMessage

export default GameServerMessage
