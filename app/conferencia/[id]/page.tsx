'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Product {
  id: string
  quantity: number
  confirmedQty: number
  unitPrice: number
  totalPrice: number
  isConfirmed: boolean
  product: {
    id: string
    name: string
    code: string
    unit: string
  }
}

interface Transfer {
  id: string
  invoiceId: string
  totalValue: number
  products: Product[]
}

export default function ConferenciPage() {
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    fetchTransfer()
  }, [])

  const fetchTransfer = async () => {
    try {
      const response = await fetch(`/api/transfers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTransfer(data)
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Erro ao carregar transferência:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, confirmedQty: quantity }
        : product
    ))
  }

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            isConfirmed: checked,
            confirmedQty: checked ? product.quantity : 0
          }
        : product
    ))
  }

  const handleSelectAll = () => {
    const allSelected = products.every(p => p.isConfirmed)
    setProducts(prev => prev.map(product => ({
      ...product,
      isConfirmed: !allSelected,
      confirmedQty: !allSelected ? product.quantity : 0
    })))
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/transfers/${params.id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      })

      if (response.ok) {
        alert('Transferência confirmada com sucesso!')
        router.push('/historico')
      } else {
        alert('Erro ao confirmar transferência')
      }
    } catch (error) {
      alert('Erro ao salvar confirmação')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="text-center">
        <div className="text-red-600">Transferência não encontrada</div>
      </div>
    )
  }

  const confirmedProducts = products.filter(p => p.isConfirmed)
  const totalConfirmed = confirmedProducts.reduce((sum, p) => 
    sum + (p.confirmedQty * p.unitPrice), 0
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Conferência - Nota Fiscal #{transfer.invoiceId}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Valor Total: R$ {transfer.totalValue.toFixed(2)}
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {products.every(p => p.isConfirmed) ? 'Desmarcar Todos' : 'Marcar Todos'}
            </button>
            <div className="text-sm text-gray-600">
              {confirmedProducts.length} de {products.length} produtos confirmados
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd. Original
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd. Confirmada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={product.isConfirmed}
                        onChange={(e) => handleCheckboxChange(product.id, e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.product.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity} {product.product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={product.confirmedQty}
                        onChange={(e) => handleQuantityChange(product.id, parseFloat(e.target.value) || 0)}
                        min="0"
                        max={product.quantity}
                        step="0.01"
                        disabled={!product.isConfirmed}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {product.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(product.confirmedQty * product.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-gray-50 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Confirmado:</span>
              <span className="text-xl font-bold text-primary-600">
                R$ {totalConfirmed.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || confirmedProducts.length === 0}
              className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
            >
              {saving ? 'Salvando...' : 'Confirmar Transferência'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}