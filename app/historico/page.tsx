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

export default function HistoricoPage() {
  const [data, setData] = useState<TransfersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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
                        const response = await fetch(`/api/transfers/${transfer.id}/launch`, {
                          method: 'POST'
                        })
                        if (response.ok) {
                          alert('Entrada lançada no Bling com sucesso!')
                          fetchTransfers()
                        } else {
                          alert('Erro ao lançar no Bling')
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

      {data && data.pagination.pages > 1 && (
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