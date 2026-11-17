USE tienda_jdstore;

-- Agregar campos para Facturación Electrónica a la tabla ventas
ALTER TABLE ventas
ADD COLUMN enlace_pdf VARCHAR(255) NULL COMMENT 'Enlace al PDF generado por Nubefact',
ADD COLUMN enlace_xml VARCHAR(255) NULL COMMENT 'Enlace al XML generado por Nubefact',
ADD COLUMN enlace_cdr VARCHAR(255) NULL COMMENT 'Enlace al CDR generado por Nubefact',
ADD COLUMN sunat_ticket VARCHAR(100) NULL COMMENT 'Ticket devuelto por SUNAT',
ADD COLUMN estado_sunat INT DEFAULT 0 COMMENT '0: Pendiente/No enviado, 1: Aceptado, 2: Rechazado, 3: Anulado';
