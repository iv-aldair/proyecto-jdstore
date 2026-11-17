import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TiendaContext = createContext(null)

export function TiendaProvider({ children }) {
  const { usuario } = useAuth()
  
  // Estado para la tienda actual seleccionada
  const [tiendaActiva, setTiendaActiva] = useState(null)
  // Lista de todas las tiendas para el selector
  const [tiendas, setTiendas] = useState([])
  const [cargandoTiendas, setCargandoTiendas] = useState(true)

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        const { data } = await api.get('/tiendas')
        setTiendas(data.datos || [])
        
        // Lógica para elegir la tienda por defecto:
        // 1. Miramos el localStorage (si el vendedor ya eligió antes)
        const guardada = localStorage.getItem('jdstore_tienda_activa')
        if (guardada) {
          const t = data.datos.find(x => x.id_tienda === parseInt(guardada))
          if (t) {
            setTiendaActiva(t)
            setCargandoTiendas(false)
            return
          }
        }
        
        // 2. Si no hay en localStorage, usamos la asignada en BD al usuario
        if (usuario?.id_tienda) {
          const t = data.datos.find(x => x.id_tienda === usuario.id_tienda)
          if (t) {
            setTiendaActiva(t)
            localStorage.setItem('jdstore_tienda_activa', t.id_tienda)
            setCargandoTiendas(false)
            return
          }
        }
        
        // 3. Fallback: la primera tienda disponible
        if (data.datos.length > 0) {
          setTiendaActiva(data.datos[0])
          localStorage.setItem('jdstore_tienda_activa', data.datos[0].id_tienda)
        }
        
      } catch (error) {
        toast.error('Error al cargar la lista de tiendas')
      } finally {
        setCargandoTiendas(false)
      }
    }
    
    if (usuario) {
      fetchTiendas()
    }
  }, [usuario])

  const cambiarTienda = (id_tienda) => {
    const t = tiendas.find(x => x.id_tienda === parseInt(id_tienda))
    if (t) {
      setTiendaActiva(t)
      localStorage.setItem('jdstore_tienda_activa', t.id_tienda)
      toast.success(`Cambiando a: ${t.nombre_tienda}`, { icon: '🏢' })
    }
  }

  return (
    <TiendaContext.Provider value={{ 
      idTienda: tiendaActiva?.id_tienda || null, 
      nombreTienda: tiendaActiva?.nombre_tienda || 'Cargando...',
      tiendas,
      cambiarTienda,
      cargandoTiendas
    }}>
      {children}
    </TiendaContext.Provider>
  )
}

export const useTienda = () => useContext(TiendaContext)