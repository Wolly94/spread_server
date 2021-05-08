import { SpreadMap } from '../game/map'
import { ClientGameState } from './clientGameState'

export interface SetPlayerIdMessage {
    type: 'playerid'
    data: {
        playerId: number | null
    }
}

export interface ClientAiPlayer {
    type: 'ai'
    playerId: number
}

export interface ClientHumanPlayer {
    type: 'human'
    name: string
    playerId: number
}

export interface ClientObserver {
    name: string
}

export type ClientLobbyPlayer = ClientAiPlayer | ClientHumanPlayer

export interface ClientLobbyState {
    players: ClientLobbyPlayer[]
    observers: ClientObserver[]
    map: SpreadMap | null
}

export interface LobbyStateMessage {
    type: 'lobbystate'
    data: ClientLobbyState
}

export interface GameStateMessage {
    type: 'gamestate'
    data: ClientGameState
}

export interface GameOverMessage {
    type: 'gameover'
    data: null
}

export type ServerLobbyMessage = SetPlayerIdMessage | LobbyStateMessage
export type ServerInGameMessage = GameStateMessage | GameOverMessage

type GameServerMessage = ServerLobbyMessage | ServerInGameMessage

export const isServerLobbyMessage = (
    msg: GameServerMessage,
): msg is ServerLobbyMessage => {
    return msg.type === 'lobbystate' || msg.type === 'playerid'
}

export default GameServerMessage
