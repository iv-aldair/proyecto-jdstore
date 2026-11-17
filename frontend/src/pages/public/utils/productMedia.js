import {
  Laptop, Cpu, Monitor, Printer, HardDrive, Cable, Projector, Headphones
} from 'lucide-react'

export function obtenerImagenesProducto(prod) {
  const codigo = (prod?.codigo_producto || '').toUpperCase()
  const nombre = (prod?.nombre || '').toLowerCase()
  const cat = (prod?.nombre_categoria || '').toLowerCase()

  if (codigo.includes('LAP-HP-002') || nombre.includes('victus') || nombre.includes('gamer')) {
    return [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (codigo.includes('LAP-LEN-002') || nombre.includes('thinkpad')) {
    return [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('laptop')) {
    return [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('computadora') || codigo.startsWith('PC-')) {
    return [
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('monitor') || codigo.startsWith('MON-')) {
    return [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('impresora') || codigo.startsWith('IMP-')) {
    return [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('tinta') || cat.includes('tóner') || codigo.startsWith('TIN-') || codigo.startsWith('TON-')) {
    return [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('teclado') || cat.includes('mouse') || codigo.startsWith('TEC-')) {
    if (nombre.includes('mouse') && !nombre.includes('kit')) {
      return [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&h=675&q=85',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&h=675&q=85'
      ]
    }
    return [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('memoria') || cat.includes('almacenamiento') || codigo.startsWith('MEM-')) {
    return [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (cat.includes('proyector') || codigo.startsWith('PRO-')) {
    return [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  if (nombre.includes('audifono') || nombre.includes('audio') || cat.includes('accesorio')) {
    return [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&h=675&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&h=675&q=85'
    ]
  }
  return [
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=900&h=675&q=85',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&h=675&q=85'
  ]
}

export function iconoPorCategoria(nombreCat = '') {
  const c = nombreCat.toLowerCase()
  if (c.includes('laptop')) return Laptop
  if (c.includes('computadora')) return Cpu
  if (c.includes('monitor')) return Monitor
  if (c.includes('impresora') || c.includes('tinta')) return Printer
  if (c.includes('memoria')) return HardDrive
  if (c.includes('cable')) return Cable
  if (c.includes('proyector')) return Projector
  return Headphones
}

export function generarUrlWhatsAppProducto(prod, cant = 1, numeroWhatsapp = '51951234567') {
  const numLimpio = (numeroWhatsapp || '51951234567').replace(/\D/g, '')
  const precioUnit = Number(prod.precio).toFixed(2)
  const subtotal = (Number(prod.precio) * cant).toFixed(2)
  const texto =
    `¡Hola *JD STORE*! 👋 Deseo comprar el siguiente producto visto en su página web:\n\n` +
    `📦 *Producto:* ${prod.nombre}\n` +
    `🏷️ *Marca / Modelo:* ${prod.nombre_marca} | ${prod.modelo || prod.codigo_producto}\n` +
    `🔢 *Código:* ${prod.codigo_producto}\n` +
    `🛒 *Cantidad:* ${cant} unidad(es)\n` +
    `💰 *Precio Unitario:* S/ ${precioUnit}\n` +
    `💵 *Total a Pagar:* S/ ${subtotal}\n\n` +
    `¿Me confirman disponibilidad para concretar la compra?`
  return `https://wa.me/${numLimpio}?text=${encodeURIComponent(texto)}`
}
