import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Se houve erro na autorização
    if (error) {
      console.error('Erro na autorização OAuth:', error)
      return NextResponse.redirect(
        new URL(`/configuracao-api?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Se não tem código, erro
    if (!code) {
      console.error('Código de autorização não fornecido')
      return NextResponse.redirect(
        new URL('/configuracao-api?error=no_code', request.url)
      )
    }

    console.log('Código de autorização recebido:', code)

    // Aqui você precisará trocar o código pelo token
    // Por ora, vamos redirecionar com o código para o usuário configurar manualmente
    return NextResponse.redirect(
      new URL(`/configuracao-api?code=${encodeURIComponent(code)}&step=3`, request.url)
    )

  } catch (error: any) {
    console.error('Erro no callback OAuth:', error)
    return NextResponse.redirect(
      new URL(`/configuracao-api?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}