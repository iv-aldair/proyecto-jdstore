import {
  createSerie,
  getSeriesDisponibles,
  marcarComoVendido,
} from "../models/productoSeries.model.js";

// Crear serie con validación
export const crearSerieService = async (data) => {
  const { numero_serie } = data;

  if (!numero_serie) {
    throw new Error("El número de serie es obligatorio");
  }

  try {
    return await createSerie(data);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El número de serie ya existe");
    }
    throw error;
  }
};

// Listar series disponibles
export const listarSeriesDisponiblesService = async (id_producto, id_tienda) => {
  return await getSeriesDisponibles(id_producto, id_tienda);
};

// Vender serie con validación
export const venderSerieService = async (id_serie) => {
  const series = await getSeriesDisponibles(null, null);

  const existe = series.find((s) => s.id_serie == id_serie);

  if (!existe) {
    throw new Error("La serie no existe o ya fue vendida");
  }

  return await marcarComoVendido(id_serie);
};