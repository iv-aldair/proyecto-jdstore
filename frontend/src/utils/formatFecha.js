export const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' })

export const formatFechaHora = (fecha) =>
  new Date(fecha).toLocaleString('es-PE', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit',
  })

export const fechaHoy = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}