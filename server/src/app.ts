import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRouter from './routes/auth'

const app = express()

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      const ok = /^https?:\/\/localhost(?::\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)
      cb(null, ok)
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRouter)

export default app

