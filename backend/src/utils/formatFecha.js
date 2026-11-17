const toYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Devuelve fecha en formato YYYY-MM-DD (Perú UTC-5) */
const hoy = () => toYMD(new Date());

/** Rango para "esta semana" (lun-dom) */
const semanaActual = () => {
  const hoyDate = new Date();
  const dia = hoyDate.getDay() || 7;
  const lunes = new Date(hoyDate);
  lunes.setDate(hoyDate.getDate() - dia + 1);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return {
    inicio: toYMD(lunes),
    fin:    toYMD(domingo),
  };
};

/** Primer y último día del mes actual */
const mesActual = () => {
  const d = new Date();
  const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
  const fin    = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { inicio: toYMD(inicio), fin: toYMD(fin) };
};

module.exports = { hoy, semanaActual, mesActual };