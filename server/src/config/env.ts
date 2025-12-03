import 'dotenv/config'
import crypto from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const PORT = Number(process.env.PORT || 4000)
const NODE_ENV = process.env.NODE_ENV || 'development'

export const env = { JWT_SECRET, PORT, NODE_ENV }

