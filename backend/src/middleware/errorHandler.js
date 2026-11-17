const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
 
  const status = err.status || 500;
  const mensaje = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;
 
  res.status(status).json({ ok: false, mensaje });
};
 
module.exports = errorHandler;
 