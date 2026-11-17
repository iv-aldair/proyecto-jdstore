// Uso: soloAdmin, soloVendedor, o cualquier rol
const soloAdmin = (req, res, next) => {
  if (req.usuario?.id_rol !== 1) {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: solo Administradores' });
  }
  next();
};

const soloVendedor = (req, res, next) => {
  if (req.usuario?.id_rol !== 2) {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: solo Vendedores' });
  }
  next();
};

const adminOVendedor = (req, res, next) => {
  if (![1, 2].includes(req.usuario?.id_rol)) {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
  }
  next();
};

module.exports = { soloAdmin, soloVendedor, adminOVendedor };