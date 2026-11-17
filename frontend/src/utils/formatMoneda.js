export const formatMoneda = (valor) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor ?? 0)

export const formatNumero = (valor) =>
  new Intl.NumberFormat('es-PE').format(valor ?? 0)