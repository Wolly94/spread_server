import { SpreadMap } from '../game/map'
import { ClientInGameMessage } from './clientInGameMessage'
import { ClientLobbyMessage } from './clientLobbyMessage'

type GameClientMessageData = ClientLobbyMessage | ClientInGameMessage

export const isClientLobbyMessage = (
    msg: GameClientMessageData,
): msg is ClientLobbyMessage => {
    return !(msg.type === 'sendunits')
}

export default GameClientMessageData
