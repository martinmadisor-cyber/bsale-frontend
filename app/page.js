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
