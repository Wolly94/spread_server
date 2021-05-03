import crypto from 'crypto'

const defaultSize = 32

const generateToken = () => {
    return crypto.randomBytes(defaultSize).toString('hex').slice(0, defaultSize)
}

export default generateToken
