import { GetReplayMessage } from '../replay/clientReplayMessages'
import { ClientInGameMessage } from './clientInGameMessage'
import { ClientLobbyMessage } from './clientLobbyMessage'

type GameClientMessageData =
    | ClientLobbyMessage
    | ClientInGameMessage
    | GetReplayMessage

export const isClientLobbyMessage = (
    msg: GameClientMessageData,
): msg is ClientLobbyMessage => {
    return !(msg.type === 'sendunits' || msg.type === 'getreplay')
}

export default GameClientMessageData
