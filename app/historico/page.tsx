'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Transfer {
  id: string
  invoiceId: string
  status: string
  totalValue: number
  createdAt: string
  confirmedAt?: string
  user: {
    name: string
    email: string
  }
  products: Array<{
    id: string
    quantity: number
    confirmedQty: number
    isConfirmed: boolean
    product: {
      name: string
    }
  }>
}

interface TransfersResponse {
  transfers: Transfer[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface LaunchResult {
  resumo: {
    totalProdutos: number
    sucessos: number
    erros: number
    status: string
  }
  produtosSucesso: Array<{
    codigo: string
    nome: string
    quantidade: number
    status: string
  }>
  produtosErro: Array<{
    codigo: string
    nome: string
    quantidade: number
    erro: string
    status: string
  }>
}

export default function HistoricoPage() {
  const [data, setData] = useState<TransfersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTransfers()
  }, [statusFilter, currentPage])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/transfers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar transferências:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Transferências</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as transferências realizadas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            Nova Transferência
          </Link>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Concluído</option>
        </select>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.transfers.map((transfer) => (
            <li key={transfer.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      Nota Fiscal #{transfer.invoiceId}
                    </p>
                    <div className="ml-2">
                      {getStatusBadge(transfer.status)}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {transfer.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {transfer.products.filter(p => p.isConfirmed).length} de {transfer.products.length} produtos confirmados
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Por: {transfer.user.name}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Criado em {formatDate(transfer.createdAt)}
                    </p>
                    {transfer.confirmedAt && (
                      <p className="ml-4">
                        Confirmado em {formatDate(transfer.confirmedAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                {transfer.status === 'pending' && (
                  <div className="mt-3">
                    <Link
                      href={`/conferencia/${transfer.id}`}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Continuar conferência →
                    </Link>
                  </div>
                )}
                
                {transfer.status === 'confirmed' && (
                  <div className="mt-3 flex space-x-4">
                    <Link
                      href={`/conferencia/${transfer.id}`}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Ver detalhes
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/transfers/${transfer.id}/launch`, {
                            method: 'POST'
                          })
                          const result = await response.json()
                          
                          if (response.ok) {
                            setLaunchResult(result.relatorio)
                            setShowModal(true)
                            fetchTransfers()
                          } else {
                            alert(`Erro ao lançar no Bling: ${result.error}`)
                          }
                        } catch (error) {
                          alert('Erro ao comunicar com o servidor')
                        }
                      }}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Lançar no Bling
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal do Relatório */}
      {showModal && launchResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Relatório de Transferência
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Resumo */}
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Resumo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{launchResult.resumo.totalProdutos}</div>
                    <div className="text-sm text-gray-600">Total de Produtos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{launchResult.resumo.sucessos}</div>
                    <div className="text-sm text-gray-600">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{launchResult.resumo.erros}</div>
                    <div className="text-sm text-gray-600">Erros</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    launchResult.resumo.erros === 0 
                      ? 'bg-green-100 text-green-800' 
                      : launchResult.resumo.sucessos === 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {launchResult.resumo.status}
                  </span>
                </div>
              </div>

              {/* Produtos com Sucesso */}
              {launchResult.produtosSucesso.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-green-800 mb-3">
                    ✓ Produtos Transferidos com Sucesso ({launchResult.produtosSucesso.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {launchResult.produtosSucesso.map((produto, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.codigo}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{produto.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.quantidade}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {produto.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Produtos com Erro */}
              {launchResult.produtosErro.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-red-800 mb-3">
                    ✗ Produtos com Erro ({launchResult.produtosErro.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erro</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {launchResult.produtosErro.map((produto, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.codigo}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{produto.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produto.quantidade}</td>
                            <td className="px-6 py-4 text-sm text-red-600">{produto.erro}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && data.pagination.pages > 1 && !showModal && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              Anterior
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Página {data.pagination.page} de {data.pagination.pages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
              disabled={currentPage === data.pagination.pages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              Próxima
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}