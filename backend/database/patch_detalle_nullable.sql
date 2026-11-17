-- ============================================================
-- PARCHE: Permitir id_producto NULL en detalle_venta
-- Para: Productos de consignación (préstamo de otra tienda)
--       y servicios técnicos
-- Fecha: 2026-09-11
-- ============================================================

-- 1. Eliminar la FK existente que impide NULL
ALTER TABLE detalle_venta DROP FOREIGN KEY detalle_venta_ibfk_2;

-- 2. Modificar la columna para permitir NULL
ALTER TABLE detalle_venta MODIFY COLUMN id_producto INT NULL;

-- 3. Volver a crear la FK pero permitiendo NULL
ALTER TABLE detalle_venta 
  ADD CONSTRAINT detalle_venta_ibfk_2 
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
  ON DELETE SET NULL;

-- 4. Agregar columna para nombre de producto externo si no existe
-- (puede que ya exista por parches anteriores)
ALTER TABLE detalle_venta 
  ADD COLUMN IF NOT EXISTS nombre_producto_externo VARCHAR(200) NULL 
  COMMENT 'Nombre del producto cuando es de consignación o servicio';

-- Verificar
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'detalle_venta' AND TABLE_SCHEMA = 'tienda_jdstore'
ORDER BY ORDINAL_POSITION;
