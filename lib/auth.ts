import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'
  private static readonly SALT_ROUNDS = 12

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    )
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      }
    } catch (error) {
      return null
    }
  }

  static async createUser(email: string, password: string, name: string): Promise<AuthUser> {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('Usuário já existe')
    }

    const hashedPassword = await this.hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }

  static async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return null
    }

    const isValid = await this.verifyPassword(password, user.password)
    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
}