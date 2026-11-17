export const IGV = 0.18

export const descomponerTotal = (total) => {
  const t        = parseFloat(total)
  const subtotal = parseFloat((t / 1.18).toFixed(2))
  const igv      = parseFloat((t - subtotal).toFixed(2))
  return { subtotal, igv, total: t }
}

export const calcularDesdeItems = (items) => {
  const total    = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0)
  return descomponerTotal(total)
}