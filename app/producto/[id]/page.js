'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductoDetalle({ params }) {
  const [producto, setProducto] = useState(null)
  const [variantes, setVariantes] = useState([])
  const [stocks, setStocks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingVariantes, setLoadingVariantes] = useState(false)

  useEffect(() => {
    const id = params.id
    
    fetch(`https://bsale-proxy.vercel.app/api/bsale/products/${id}.json`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProducto(data.data)
          cargarVariantes(id)
        } else {
          setError('Error al cargar el producto')
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Error de conexion: ' + err.message)
        setLoading(false)
      })
  }, [params.id])

  const cargarVariantes = async (productoId) => {
    setLoadingVariantes(true)
    try {
      const response = await fetch(`https://bsale-proxy.vercel.app/api/bsale/products/${productoId}/variants.json`)
      const data = await response.json()
      
      if (data.success && data.data.items) {
        const variantesData = data.data.items
        setVariantes(variantesData)
        
        // Cargar stock de cada variante
        await cargarStocks(variantesData)
      }
    } catch (err) {
      console.error('Error cargando variantes:', err)
    }
    setLoadingVariantes(false)
  }

  const cargarStocks = async (variantesData) => {
    const stocksTemp = {}
    
    for (const variante of variantesData) {
      try {
        const response = await fetch(`https://bsale-proxy.vercel.app/api/bsale/stocks.json?variantid=${variante.id}`)
        const data = await response.json()
        
        if (data.success && data.data.items) {
          const stockTotal = data.data.items.reduce((total, stock) => {
            return total + (stock.quantityAvailable || 0)
          }, 0)
          stocksTemp[variante.id] = stockTotal
        }
      } catch (err) {
        console.error(`Error cargando stock de variante ${variante.id}:`, err)
        stocksTemp[variante.id] = 0
      }
    }
    
    setStocks(stocksTemp)
  }

  const calcularStockTotal = () => {
    if (variantes.length === 0) return 'Sin variantes'
    
    const hayStockIlimitado = variantes.some(v => v.unlimitedStock === 1)
    if (hayStockIlimitado) return 'Ilimitado'
    
    const stockTotal = Object.values(stocks).reduce((total, stock) => total + stock, 0)
    
    return stockTotal
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando producto...</div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Producto no encontrado'}</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Volver al catalogo
          </Link>
        </div>
      </div>
    )
  }

  const stockTotal = calcularStockTotal()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Volver al catalogo
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {producto.name}
            </h1>
            <span className={`px-3 py-1 text-sm rounded-full ${
              producto.state === 1 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {producto.state === 1 ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {producto.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Descripcion</h2>
              <p className="text-gray-600">{producto.description}</p>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Stock Total</h2>
              {loadingVariantes ? (
                <span className="text-gray-500">Cargando...</span>
              ) : (
                <span className={`text-2xl font-bold ${
                  stockTotal === 'Ilimitado' 
                    ? 'text-green-600' 
                    : stockTotal === 'Sin variantes'
                    ? 'text-gray-500'
                    : typeof stockTotal === 'number' && stockTotal > 0
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}>
                  {stockTotal === 'Sin variantes' ? 'N/A' : stockTotal}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Informacion General</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{producto.id}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Control de Stock:</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    producto.stockControl === 1 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {producto.stockControl === 1 ? 'Si' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Informacion Adicional</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Cuenta Contable:</span>
                  <span className="font-medium">{producto.ledgerAccount || 'No asignada'}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Centro de Costo:</span>
                  <span className="font-medium">{producto.costCenter || 'No asignado'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Variantes y Stock Detallado
            </h2>
            
            {loadingVariantes ? (
              <div className="text-center py-8 text-gray-500">
                Cargando variantes y stock...
              </div>
            ) : variantes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variantes.map((variante) => {
                  const stockVariante = stocks[variante.id] || 0
                  
                  return (
                    <div 
                      key={variante.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {variante.description || `Variante ${variante.id}`}
                        </h3>
                        {variante.unlimitedStock === 1 ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Stock Ilimitado
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded font-bold ${
                            stockVariante > 10
                              ? 'bg-green-100 text-green-800'
                              : stockVariante > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Stock: {stockVariante}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Codigo: {variante.code || 'N/A'}</p>
                        <p>Codigo de barras: {variante.barCode || 'N/A'}</p>
                        <p className={`font-medium ${
                          variante.state === 1 ? 'text-green-600' : 'text-red-600'
    </div>
  )
}
