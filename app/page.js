'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalProductos, setTotalProductos] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroStock, setFiltroStock] = useState('todos')
  
  const limit = 25
  const totalPages = Math.ceil(totalProductos / limit)

  useEffect(() => {
    setLoading(true)
    const offset = page * limit
    
    fetch(`https://bsale-proxy.vercel.app/api/bsale/products.json?limit=${limit}&offset=${offset}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProductos(data.data.items)
          setTotalProductos(data.data.count)
        } else {
          setError('Error al cargar productos')
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Error de conexion: ' + err.message)
        setLoading(false)
      })
  }, [page])

  useEffect(() => {
    let resultado = productos

    if (busqueda.trim() !== '') {
      resultado = resultado.filter(producto =>
        producto.name.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    if (filtroEstado !== 'todos') {
      const estadoValor = filtroEstado === 'activo' ? 1 : 0
      resultado = resultado.filter(producto => producto.state === estadoValor)
    }

    if (filtroStock !== 'todos') {
      const stockValor = filtroStock === 'con-control' ? 1 : 0
      resultado = resultado.filter(producto => producto.stockControl === stockValor)
    }

    setProductosFiltrados(resultado)
  }, [busqueda, filtroEstado, filtroStock, productos])

  const irPaginaSiguiente = () => {
    if (page < totalPages - 1) {
      setPage(page + 1)
      limpiarFiltros()
      window.scrollTo(0, 0)
    }
  }

  const irPaginaAnterior = () => {
    if (page > 0) {
      setPage(page - 1)
      limpiarFiltros()
      window.scrollTo(0, 0)
    }
  }

  const irPrimeraPagina = () => {
    setPage(0)
    limpiarFiltros()
    window.scrollTo(0, 0)
  }

  const irUltimaPagina = () => {
    setPage(totalPages - 1)
    limpiarFiltros()
    window.scrollTo(0, 0)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('todos')
    setFiltroStock('todos')
  }

  const hayFiltrosActivos = busqueda !== '' || filtroEstado !== 'todos' || filtroStock !== 'todos'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando productos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Catalogo de Productos Bsale
          </h1>
          <Link 
            href="/documentos"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Ver Documentos
          </Link>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="text-gray-600">
            <p>Total de productos: {totalProductos}</p>
            <p>Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, totalProductos)} de {totalProductos}</p>
            <p>Pagina {page + 1} de {totalPages}</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control de Stock
              </label>
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="con-control">Con control</option>
                <option value="sin-control">Sin control</option>
              </select>
            </div>

            {hayFiltrosActivos && (
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {hayFiltrosActivos && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Filtros aplicados:</p>
                <ul className="list-disc list-inside space-y-1">
                  {busqueda && <li>Busqueda: {busqueda}</li>}
                  {filtroEstado !== 'todos' && <li>Estado: {filtroEstado === 'activo' ? 'Activos' : 'Inactivos'}</li>}
                  {filtroStock !== 'todos' && <li>Control de stock: {filtroStock === 'con-control' ? 'Con control' : 'Sin control'}</li>}
                </ul>
                <p className="mt-2 font-medium">
                  Resultados: {productosFiltrados.length} de {productos.length} productos
                </p>
              </div>
            </div>
          )}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
            <p className="text-gray-400 text-sm">Intenta cambiar los filtros o la busqueda</p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {productosFiltrados.map((producto) => (
              <Link 
                key={producto.id}
                href={`/producto/${producto.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow block cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 flex-1">
                    {producto.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    producto.state === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.state === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>ID: {producto.id}</p>
                  <p className="flex items-center gap-2">
                    Control de stock: 
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      producto.stockControl === 1 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {producto.stockControl === 1 ? 'Si' : 'No'}
                    </span>
                  </p>
                </div>

                <p className="mt-4 text-blue-600">
                  Ver detalles →
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={irPrimeraPagina}
            disabled={page === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Primera
          </button>
          
          <button
            onClick={irPaginaAnterior}
            disabled={page === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            ← Anterior
          </button>

          <span className="px-4 py-2 bg-gray-100 rounded-lg">
            {page + 1} / {totalPages}
          </span>

          <button
            onClick={irPaginaSiguiente}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Siguiente →
          </button>

          <button
            onClick={irUltimaPagina}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Ultima
          </button>
        </div>
      </div>
    </div>
  )
}
