import { Ai } from './ai'
import AiClient from './aiClient'

export const connect = (serverUrl: string, ai: Ai) => {
    const aiClient = new AiClient(serverUrl, ai)
    return aiClient
}
