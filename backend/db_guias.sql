CREATE TABLE IF NOT EXISTS guias_remision (
  id_guia INT AUTO_INCREMENT PRIMARY KEY,
  id_tienda INT NOT NULL,
  id_usuario INT NOT NULL,
  numero_guia VARCHAR(20) NOT NULL,
  fecha_emision DATE NOT NULL,
  
  -- Punto Partida
  partida_direccion VARCHAR(255) NOT NULL,
  partida_ubigeo VARCHAR(10) NOT NULL,
  partida_codigo VARCHAR(20),
  
  -- Punto Llegada
  llegada_direccion VARCHAR(255) NOT NULL,
  llegada_ubigeo VARCHAR(10) NOT NULL,
  llegada_codigo VARCHAR(20),
  
  -- Destinatario
  destinatario_razon_social VARCHAR(150) NOT NULL,
  destinatario_identificacion VARCHAR(20) NOT NULL,
  destinatario_tipo_doc VARCHAR(20) NOT NULL,
  destinatario_direccion VARCHAR(255),
  
  -- Datos de Envío
  motivo_traslado VARCHAR(50) NOT NULL,
  peso_bruto DECIMAL(10,2) NOT NULL,
  bultos INT,
  modalidad_traslado VARCHAR(50),
  fecha_inicio_traslado DATE,
  
  -- Datos Transportista
  transp_razon_social VARCHAR(150),
  transp_identidad VARCHAR(20),
  transp_placa VARCHAR(20),
  transp_conductor VARCHAR(150),
  transp_doc_identidad VARCHAR(20),
  transp_licencia VARCHAR(20),
  
  -- Documento Relacionado
  doc_rel_numero VARCHAR(50),
  doc_rel_tipo VARCHAR(50),
  doc_rel_ruc VARCHAR(20),
  
  estado TINYINT DEFAULT 1, -- 1: Emitida, 0: Anulada
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guia_remision_detalles (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_guia INT NOT NULL,
  id_producto INT NOT NULL,
  codigo_producto VARCHAR(50),
  descripcion VARCHAR(255) NOT NULL,
  unidad VARCHAR(10) DEFAULT 'NIU',
  cantidad INT NOT NULL,
  series TEXT,
  
  FOREIGN KEY (id_guia) REFERENCES guias_remision(id_guia) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backups (
  id_backup INT AUTO_INCREMENT PRIMARY KEY,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tamanio_kb INT DEFAULT 0,
  tipo VARCHAR(50) DEFAULT 'automatico',
  estado VARCHAR(50) DEFAULT 'ok',
  mensaje_error TEXT,
  id_usuario INT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
