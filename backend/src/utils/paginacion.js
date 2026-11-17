/**
 * Construye meta de paginación y slice de resultados
 * @param {Array} datos - todos los registros
 * @param {number} pagina
 * @param {number} limite
 */
const construirPaginacion = (datos, pagina, limite) => {
  const total = datos.length;
  const totalPaginas = Math.ceil(total / limite);
  const offset = (pagina - 1) * limite;
  const items = datos.slice(offset, offset + limite);
  return {
    items,
    paginacion: { total, pagina, limite, totalPaginas },
  };
};
 
module.exports = { construirPaginacion };
 