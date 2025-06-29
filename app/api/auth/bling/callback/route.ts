import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Marcar como dinâmico para evitar erro de renderização estática
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Sempre usar URL de produção para redirecionamentos
    const baseUrl = process.env.NEXTAUTH_URL || 'https://pbs-production-9e7c.up.railway.app'

    // Se houve erro na autorização
    if (error) {
      console.error('Erro na autorização OAuth:', error)
      return NextResponse.redirect(
        new URL(`/configuracao-api?error=${encodeURIComponent(error)}`, baseUrl)
      )
    }

    // Se não tem código, erro
    if (!code) {
      console.error('Código de autorização não fornecido')
      return NextResponse.redirect(
        new URL('/configuracao-api?error=no_code', baseUrl)
      )
    }

    console.log('Código de autorização recebido:', code)

    // Aqui você precisará trocar o código pelo token
    // Por ora, vamos redirecionar com o código para o usuário configurar manualmente
    return NextResponse.redirect(
      new URL(`/configuracao-api?code=${encodeURIComponent(code)}&step=3`, baseUrl)
    )

  } catch (error: any) {
    console.error('Erro no callback OAuth:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://pbs-production-9e7c.up.railway.app'
    return NextResponse.redirect(
      new URL(`/configuracao-api?error=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}