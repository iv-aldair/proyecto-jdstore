/** Respuesta de éxito estándar */
const ok = (res, datos, mensaje = 'OK', status = 200) =>
  res.status(status).json({ ok: true, mensaje, datos });

/** Respuesta de error estándar */
const error = (res, mensaje = 'Error', status = 400) =>
  res.status(status).json({ ok: false, mensaje });

/** Extrae parámetros de paginación del query string */
const paginar = (query) => {
  const pagina = Math.max(1, parseInt(query.pagina) || 1);
  const limite = Math.min(100, Math.max(1, parseInt(query.limite) || 20));
  const offset = (pagina - 1) * limite;
  return { pagina, limite, offset };
};

module.exports = { ok, error, paginar };