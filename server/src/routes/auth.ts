import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'

const prisma = new PrismaClient()
const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
})

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const { email, password, name } = parsed.data
    const emailNorm = email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email: emailNorm, name, password: hash } })
    return res.status(201).json({ id: user.id, email: user.email, name: user.name })
  } catch (e: any) {
    return res.status(500).json({ error: 'Server error' })
  }
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const { email, password } = parsed.data
    const emailNorm = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token })
  } catch (e: any) {
    return res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).auth
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ error: 'Not found' })
    return res.json({ id: user.id, email: user.email, name: user.name })
  } catch (e: any) {
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

