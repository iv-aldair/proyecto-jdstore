const IGV = 0.18;

/**
 * Dado un total (precio de venta con IGV incluido), calcula subtotal e IGV
 * En Perú el precio ya incluye IGV: subtotal = total / 1.18
 */
const descomponerTotal = (total) => {
  const t = parseFloat(total);
  const subtotal = parseFloat((t / 1.18).toFixed(2));
  const igv = parseFloat((t - subtotal).toFixed(2));
  return { subtotal, igv, total: t };
};

/**
 * Dado un subtotal (sin IGV), calcula IGV y total
 */
const calcularDesdeSubtotal = (subtotal) => {
  const s = parseFloat(subtotal);
  const igv = parseFloat((s * IGV).toFixed(2));
  const total = parseFloat((s + igv).toFixed(2));
  return { subtotal: s, igv, total };
};

module.exports = { descomponerTotal, calcularDesdeSubtotal, IGV };