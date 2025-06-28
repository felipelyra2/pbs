'use client'

import { useState } from 'react'

export default function ConfiguracaoAPIPage() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    accessToken: ''
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Configuração API v3 do Bling
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure a integração com a API v3 para automação completa
          </p>
        </div>

        <div className="p-6">
          {/* Status Atual */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sistema em Modo Simulação
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>A API v2 do Bling foi descontinuada. Configure a API v3 para automação completa.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passos */}
          <div className="space-y-6">
            {/* Passo 1 */}
            <div className={`border rounded-lg p-4 ${step >= 1 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  1. Criar Aplicação no Bling
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  step > 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {step > 1 ? 'Concluído' : 'Em andamento'}
                </span>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Acesse: <a href="https://developer.bling.com.br/aplicativos" target="_blank" className="text-blue-600 hover:underline">https://developer.bling.com.br/aplicativos</a></li>
                  <li>Clique em "Criar Aplicativo"</li>
                  <li>Preencha os dados do aplicativo</li>
                  <li>Em "URL de Redirecionamento", coloque: <code className="bg-gray-100 px-1 rounded">https://seu-dominio.vercel.app/api/auth/bling/callback</code></li>
                  <li>Salve e anote o <strong>Client ID</strong> e <strong>Client Secret</strong></li>
                </ol>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client ID</label>
                  <input
                    type="text"
                    value={config.clientId}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu Client ID do Bling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                  <input
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu Client Secret do Bling"
                  />
                </div>
              </div>
              
              {config.clientId && config.clientSecret && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Próximo Passo
                </button>
              )}
            </div>

            {/* Passo 2 */}
            {step >= 2 && (
              <div className={`border rounded-lg p-4 ${step >= 2 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    2. Autorizar Aplicação
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    step > 2 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {step > 2 ? 'Concluído' : 'Em andamento'}
                  </span>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <p className="mb-4">Clique no botão abaixo para autorizar a aplicação no Bling:</p>
                  
                  <a
                    href={`https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${config.clientId}&scope=read,write&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/bling/callback')}`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Autorizar no Bling
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <p className="mt-4 text-xs text-gray-500">
                    Após autorizar, você receberá um código de autorização que será usado para gerar o token de acesso.
                  </p>
                </div>
                
                <button
                  onClick={() => setStep(3)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Já autorizei - Próximo
                </button>
              </div>
            )}

            {/* Passo 3 */}
            {step >= 3 && (
              <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                <h3 className="text-lg font-medium text-gray-900">
                  3. Configurar Token de Acesso
                </h3>
                
                <div className="mt-3 text-sm text-gray-600">
                  <p className="mb-4">Cole o token de acesso gerado pelo processo de autorização:</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Access Token</label>
                    <textarea
                      value={config.accessToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Cole aqui o token de acesso da API v3"
                    />
                  </div>
                  
                  {config.accessToken && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        ✅ Token configurado! Para ativar a API v3, adicione esta configuração nas variáveis de ambiente:
                      </p>
                      <code className="block mt-2 p-2 bg-green-100 rounded text-xs">
                        BLING_API_V3_TOKEN=Bearer {config.accessToken}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instruções adicionais */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📚 Recursos Úteis</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <a href="https://developer.bling.com.br/" target="_blank" className="text-blue-600 hover:underline">Documentação Oficial da API v3</a></li>
              <li>• <a href="https://developer.bling.com.br/migracao-v2-v3" target="_blank" className="text-blue-600 hover:underline">Guia de Migração v2 → v3</a></li>
              <li>• <a href="https://developer.bling.com.br/referencia" target="_blank" className="text-blue-600 hover:underline">Referência da API v3</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}