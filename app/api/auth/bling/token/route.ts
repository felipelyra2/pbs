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

    // API v3 do Bling usa Basic Auth no header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const tokenResponse = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://pbs-mu.vercel.app/api/auth/bling/callback'
    }, {
      headers: {
        'Authorization': `Basic ${credentials}`,
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
    console.error('Detalhes do erro:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    let errorMessage = 'Erro ao obter token de acesso'
    
    if (error.response?.data) {
      // Log da resposta completa para debug
      console.error('Resposta completa da API do Bling:', JSON.stringify(error.response.data, null, 2))
      
      if (error.response.data.error) {
        errorMessage = error.response.data.error_description || error.response.data.error
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      },
      { status: 500 }
    )
  }
}