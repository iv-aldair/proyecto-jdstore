-- Patch: Actualizar datos reales de las 3 tiendas JD Store
-- Fecha: 2026-04-25

UPDATE tiendas SET nombre_tienda='Tienda Central', direccion='Jr. Moquegua 705, Juliaca', telefono='995890861 / 944490020' WHERE id_tienda=1;
UPDATE tiendas SET nombre_tienda='Galería Stand A', direccion='Galería, Juliaca', telefono='995890861 / 944490020' WHERE id_tienda=2;
UPDATE tiendas SET nombre_tienda='Galería Stand J', direccion='Galería, Juliaca', telefono='995890861 / 944490020' WHERE id_tienda=3;
