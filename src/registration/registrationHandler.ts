import generateToken from './generateToken'

export interface PlayerData {
    name: string
}

export interface RegisteredToken {
    playerData: PlayerData
    token: string
}

const container: RegisteredToken[] = []

const generateName = () => {
    return 'RandomName_' + Math.floor(Math.random() * 1000).toString()
}

export const registerUser = () => {
    const token = generateToken()
    // maybe check if token is already in use? but that shouldnt happen overall
    const name = generateName()
    container.push({ playerData: { name: name }, token: token })
    return token
}

export const getPlayerData = (token: string) => {
    const name = container.find((rt) => rt.token === token)?.playerData
    if (name === undefined) return null
    else return name
}
