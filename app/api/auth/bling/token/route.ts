import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Marcar como dinâmico para evitar erro de renderização estática
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    if (!code || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Código, Client ID e Client Secret são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('Trocando código por token...')

    // Fazer a requisição para trocar o código pelo token
    const tokenResponse = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'https://pbs-mu.vercel.app/api/auth/bling/callback'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Token obtido com sucesso:', tokenResponse.data)

    return NextResponse.json({
      access_token: tokenResponse.data.access_token,
      token_type: tokenResponse.data.token_type,
      expires_in: tokenResponse.data.expires_in,
      refresh_token: tokenResponse.data.refresh_token
    })

  } catch (error: any) {
    console.error('Erro ao trocar código por token:', error)
    
    let errorMessage = 'Erro ao obter token de acesso'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error_description || error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}