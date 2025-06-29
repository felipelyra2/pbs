'use client'

import { useState, useEffect } from 'react'

interface Store {
  id: string
  name: string
  blingApiKey: string
  isActive: boolean
  createdAt: string
}

export default function LojasPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    blingApiKey: '',
    isActive: true
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingStore ? `/api/stores/${editingStore}` : '/api/stores'
      const method = editingStore ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', blingApiKey: '', isActive: true })
        setShowForm(false)
        setEditingStore(null)
        fetchStores()
        alert(editingStore ? 'Loja atualizada com sucesso!' : 'Loja criada com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      alert('Erro ao salvar loja')
    }
  }

  const handleDelete = async (storeId: string, force = false) => {
    try {
      const url = force ? `/api/stores/${storeId}?force=true` : `/api/stores/${storeId}`
      const response = await fetch(url, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchStores()
        const result = await response.json()
        alert(result.message)
      } else {
        const error = await response.json()
        
        // Se tem transferências e pode forçar exclusão
        if (error.canForceDelete) {
          const forceDelete = confirm(
            `${error.error}\n\nDeseja excluir a loja e TODAS as ${error.transfersCount} transferências associadas?\n\n⚠️ ATENÇÃO: Esta ação não pode ser desfeita!`
          )
          
          if (forceDelete) {
            handleDelete(storeId, true)
          }
        } else {
          alert(`Erro: ${error.error}`)
        }
      }
    } catch (error) {
      alert('Erro ao excluir loja')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Lojas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure as lojas e suas respectivas chaves da API do Bling.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
          >
            {showForm ? 'Cancelar' : 'Nova Loja'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingStore ? 'Editar Loja' : 'Adicionar Nova Loja'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Loja
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                Chave da API do Bling
              </label>
              <input
                type="text"
                id="apiKey"
                value={formData.blingApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, blingApiKey: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                {editingStore ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingStore(null)
                  setFormData({ name: '', blingApiKey: '', isActive: true })
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {stores.map((store) => (
            <li key={store.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600">
                      {store.name}
                    </p>
                    <div className="ml-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        store.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setFormData({
                          name: store.name,
                          blingApiKey: store.blingApiKey,
                          isActive: store.isActive
                        })
                        setEditingStore(store.id)
                        setShowForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a loja "${store.name}"?`)) {
                          handleDelete(store.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    API Key: {store.blingApiKey.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Criada em: {new Date(store.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma loja cadastrada</p>
          </div>
        )}
      </div>
    </div>
  )
}