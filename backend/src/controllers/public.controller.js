const pool = require('../config/db');
const axios = require('axios');

const PROMPT_MAESTRO_POR_DEFECTO = `Eres el Asistente Comercial Oficial de JD STORE S.C.R.L. (RUC: 20600698479), tienda líder en laptops, computadoras, monitores, impresoras y servicio técnico en Juliaca (Jr. Noriega 342) y Puno.

INSTRUCCIONES DE ENTRENAMIENTO Y TRATO AL CLIENTE:
1. TONO NATURAL Y DIRECTO: Habla como un vendedor amable, experto y claro. NUNCA menciones palabras técnicas internas como "Base de Datos MySQL", "Análisis Web", "Wikipedia" ni "Consultando servidor". Ve directo a lo que el cliente necesita.
2. RECOMENDACIONES (1 A 3 OPCIONES): Cuando el cliente pida recomendaciones (ej. gaming, ingeniería, oficina, impresoras, monitores), muéstrale de 1 a 3 opciones reales que tengamos en stock con su precio en Soles (S/), sus características principales en una línea y en qué tienda está disponible.
3. PROCESO DE COMPRA: Si pregunta "¿cómo puedo realizar la compra?" o "¿cómo compro?", explícale que puede:
   - Hacer clic en el botón verde de WhatsApp (951 234 567) para atención inmediata.
   - Agregar el producto al Carrito en la página web.
   - Visitarnos en nuestras tiendas de Juliaca (Jr. Noriega 342 / Galería Stand A) o Puno.
4. MEDIOS DE PAGO Y GARANTÍA: Aceptamos Efectivo, Yape, Plin, Transferencia (BCP, BBVA, Interbank) y Tarjetas Visa/Mastercard (+5%). Todos los equipos son nuevos en caja sellada, incluyen 12 meses de garantía oficial y entregamos Boleta o Factura Electrónica SUNAT.`;

// ── Auto-Inicialización de Tablas para la Web, CMS (Directus) y Chatbot n8n ──
async function inicializarTablasWeb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_institucional (
        id INT PRIMARY KEY DEFAULT 1,
        nombre_institucion VARCHAR(150) NOT NULL DEFAULT 'JD STORE S.C.R.L.',
        ruc VARCHAR(20) NOT NULL DEFAULT '20600698479',
        eslogan VARCHAR(255) DEFAULT 'Especialistas en Laptops, Computadoras, Monitores y Servicio Técnico en Juliaca y Puno',
        descripcion TEXT,
        mision TEXT,
        vision TEXT,
        telefono_central VARCHAR(30) DEFAULT '951 234 567',
        whatsapp VARCHAR(30) DEFAULT '51951234567',
        correo_contacto VARCHAR(100) DEFAULT 'ventas@jdstore.pe',
        direccion_principal VARCHAR(200) DEFAULT 'Jr. Noriega 342, Juliaca - Puno, Perú',
        horario_atencion VARCHAR(150) DEFAULT 'Lunes a Sábado: 8:30 AM - 8:00 PM',
        n8n_webhook_url VARCHAR(255) DEFAULT '',
        directus_url VARCHAR(255) DEFAULT 'http://localhost:8080',
        drupal_url VARCHAR(255) DEFAULT 'http://localhost:8080',
        aws_region VARCHAR(50) DEFAULT 'us-east-1 (AWS Cloud)',
        prompt_entrenamiento TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await pool.query('ALTER TABLE cms_institucional ADD COLUMN prompt_entrenamiento TEXT');
    } catch (_) {}

    try {
      await pool.query("ALTER TABLE cms_institucional ADD COLUMN drupal_url VARCHAR(255) DEFAULT 'http://localhost:8080'");
    } catch (_) {}

    await pool.query(
      'UPDATE cms_institucional SET prompt_entrenamiento = ? WHERE id = 1 AND (prompt_entrenamiento IS NULL OR prompt_entrenamiento = "")',
      [PROMPT_MAESTRO_POR_DEFECTO]
    );

    await pool.query(
      "UPDATE cms_institucional SET drupal_url = 'http://localhost:8080' WHERE id = 1 AND (drupal_url IS NULL OR drupal_url = '')"
    );

    const [instRows] = await pool.query('SELECT id FROM cms_institucional WHERE id = 1');
    if (instRows.length === 0) {
      const defaultWebhook = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/jdstore-chatbot';
      const defaultDirectus = process.env.DIRECTUS_URL || 'http://localhost:8055';
      await pool.query(`
        INSERT INTO cms_institucional (
          id, nombre_institucion, ruc, eslogan, descripcion, mision, vision,
          telefono_central, whatsapp, correo_contacto, direccion_principal, horario_atencion,
          n8n_webhook_url, directus_url, aws_region
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        1,
        'JD STORE S.C.R.L.',
        '20600698479',
        'Líderes en Laptops, Equipos de Cómputo, Impresoras y Soporte Técnico en Juliaca y Puno',
        'JD Store Sociedad Comercial de Responsabilidad Limitada es la tienda líder en tecnología e informática en Juliaca y Puno. Comercializamos laptops, computadoras de escritorio, monitores gamer y profesionales, impresoras multifuncionales, componentes, periféricos y repuestos originales con garantía real y facturación electrónica.',
        'Brindar a nuestros clientes en toda la región Puno y el sur del país equipos de cómputo y tecnología de las mejores marcas mundiales al mejor precio del mercado, acompañados de asesoría experta, garantía certificada y servicio técnico propio.',
        'Consolidarnos como la cadena de tiendas tecnológicas y mayorista de cómputo número uno del sur del Perú, destacando por nuestra innovación digital, rapidez de entrega y excelencia en atención al cliente.',
        '951 234 567',
        '51951234567',
        'ventas@jdstore.pe',
        'Jr. Noriega 342, Cercado de Juliaca - San Román, Puno',
        'Lunes a Sábado de 8:30 a.m. a 8:00 p.m.',
        defaultWebhook,
        defaultDirectus,
        'AWS us-east-1'
      ]);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_publicaciones (
        id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        categoria VARCHAR(80) DEFAULT 'Promociones',
        resumen VARCHAR(350) NOT NULL,
        contenido TEXT NOT NULL,
        imagen_url VARCHAR(500) DEFAULT '',
        autor VARCHAR(100) DEFAULT 'JD Store Oficial',
        destacado TINYINT(1) DEFAULT 0,
        estado ENUM('publicado', 'borrador') DEFAULT 'publicado',
        fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [pubRows] = await pool.query('SELECT COUNT(*) AS total FROM cms_publicaciones');
    if (pubRows[0].total === 0) {
      await pool.query(`
        INSERT INTO cms_publicaciones (titulo, categoria, resumen, contenido, imagen_url, autor, destacado, estado) VALUES
        (
          'Campaña Tecnológica 2026: Descuentos Especiales en Laptops Gamer y Profesionales',
          'Promociones',
          'Aprovecha precios especiales en Laptops HP Victus, Lenovo ThinkPad, IdeaPad y ASUS VivoBook con SSD NVMe de alta velocidad.',
          'En nuestras sucursales de Juliaca y Puno contamos con stock inmediato de laptops para ingeniería, diseño gráfico, gaming y oficina. Todos nuestros equipos incluyen garantía real de 12 meses, configuración lista para usar y envío rápido a domicilio o retiro gratis en tienda.',
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
          'Área Comercial JD Store',
          1,
          'publicado'
        ),
        (
          'Nuevos Monitores Samsung, ASUS y HP Full HD IPS con tasa de refresco fluida',
          'Novedades',
          'Renueva tu setup de trabajo o gaming con pantallas de alta definición, bordes ultradelgados y tecnología de protección visual Eye Care.',
          'Ya disponibles en tienda los nuevos monitores de 22 y 24 pulgadas con paneles IPS, tecnología FreeSync y conexiones HDMI/VGA. Ideales para programadores, arquitectos, gamers y oficinas corporativas.',
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
          'JD Store Tecnología',
          1,
          'publicado'
        ),
        (
          'Laboratorio Técnico Autorizado: Repotenciación con SSD Kingston y Mantenimiento de Impresoras',
          'Servicios Técnicos',
          'Multiplica por 10 la velocidad de tu laptop instalando discos sólidos SSD Kingston y memoria RAM DDR4 en menos de 1 hora.',
          'Nuestro equipo de especialistas realiza diagnóstico computarizado, mantenimiento preventivo con pasta térmica de alto rendimiento, limpieza ultrasónica de cabezales Epson EcoTank y Canon PIXMA, además de soporte garantizado.',
          'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
          'Laboratorio Técnico JD Store',
          1,
          'publicado'
        ),
        (
          'Atención Corporativa y Cotizaciones para Colegios, Universidades, Municipalidades y Empresas',
          'Institucional',
          'Emitimos proformas inmediatas, Facturación Electrónica SUNAT y Guías de Remisión con precios especiales por volumen.',
          'Abastecemos laboratorios de cómputo, oficinas administrativas e instituciones públicas en toda la región Puno con equipos originales, proyectores Epson de alto brillo e impresoras multifuncionales de alto rendimiento.',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
          'Ventas Corporativas JD Store',
          0,
          'publicado'
        )
      `);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS web_contactos (
        id_contacto INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        dni_ruc VARCHAR(20) DEFAULT '',
        telefono VARCHAR(30) NOT NULL,
        correo VARCHAR(120) DEFAULT '',
        asunto VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        estado ENUM('pendiente', 'atendido') DEFAULT 'pendiente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbot_logs (
        id_log INT AUTO_INCREMENT PRIMARY KEY,
        sesion_id VARCHAR(100) DEFAULT 'web-user',
        mensaje_usuario TEXT NOT NULL,
        respuesta_bot TEXT NOT NULL,
        origen VARCHAR(50) DEFAULT 'n8n-engine',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('⚠️ Error inicializando tablas web:', err.message);
  }
}

inicializarTablasWeb();

// ── Helper: Extraer filtro de precios en lenguaje natural ("3 mil", "mas de 3000", "menos de 1500") ──
function extraerFiltroPrecio(textoLower) {
  // Normalizar expresiones como "3 mil" -> "3000", "2 mil quinientos" -> "2500", "1 mil" -> "1000"
  let normalizado = textoLower
    .replace(/(\d+)\s*mil\s*quinientos/g, (_, n) => String(Number(n) * 1000 + 500))
    .replace(/(\d+(?:[.,]\d+)?)\s*mil/g, (_, n) => String(Math.round(parseFloat(n.replace(',', '.')) * 1000)))
    .replace(/\bmil\s*quinientos\b/g, '1500')
    .replace(/\bmil\b/g, '1000');

  let minPrecio = null;
  let maxPrecio = null;

  // "entre X y Y"
  const matchEntre = normalizado.match(/entre\s+(?:s\/\.?\s*)?(\d+)\s+y\s+(?:s\/\.?\s*)?(\d+)/);
  if (matchEntre) {
    minPrecio = Number(matchEntre[1]);
    maxPrecio = Number(matchEntre[2]);
    return { minPrecio, maxPrecio };
  }

  // "a partir de X", "mas de X", "más de X", "mayor a X", "mayores a X", "arriba de X", "desde X", "superiores a X", "superior a X"
  const matchMin = normalizado.match(/(?:a partir de|mas de|más de|mayor(?:es)? (?:a|de|que)|arriba de|desde|superior(?:es)? a|sobre)\s*(?:s\/\.?\s*)?(\d+)/);
  if (matchMin) {
    minPrecio = Number(matchMin[1]);
  }

  // "menos de X", "menor a X", "menores a X", "hasta X", "por debajo de X", "maximo X", "máximo X", "presupuesto de X"
  const matchMax = normalizado.match(/(?:menos de|menor(?:es)? (?:a|de|que)|hasta|por debajo de|maximo|máximo|presupuesto de)\s*(?:s\/\.?\s*)?(\d+)/);
  if (matchMax) {
    maxPrecio = Number(matchMax[1]);
  }

  return { minPrecio, maxPrecio };
}

// ── Helper: Conector Headless Drupal 10 (JSON:API v1.0) ─────────────────
function limpiarHtmlDrupal(texto = '') {
  return String(texto)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function obtenerArticulosDesdeDrupal(drupalUrl) {
  const baseUrl = (drupalUrl || process.env.DRUPAL_URL || 'http://localhost:8080').replace(/\/+$/, '');
  const endpoint = `${baseUrl}/jsonapi/node/article?include=field_image,field_tags&sort=-created`;
  try {
    const resp = await axios.get(endpoint, {
      timeout: 2000,
      headers: { Accept: 'application/vnd.api+json, application/json' }
    });
    if (!resp.data || !Array.isArray(resp.data.data)) {
      return { conectado: false, articulos: [], endpoint };
    }

    const included = Array.isArray(resp.data.included) ? resp.data.included : [];
    const mapaArchivos = {};
    const mapaTags = {};

    for (const inc of included) {
      if (inc.type === 'file--file' && inc.attributes?.uri?.url) {
        const rawUrl = inc.attributes.uri.url;
        mapaArchivos[inc.id] = rawUrl.startsWith('http') ? rawUrl : `${baseUrl}${rawUrl}`;
      }
      if (inc.type?.startsWith('taxonomy_term') && inc.attributes?.name) {
        mapaTags[inc.id] = inc.attributes.name;
      }
    }

    const articulos = resp.data.data.map((nodo, idx) => {
      const attr = nodo.attributes || {};
      const bodyRaw = attr.body?.value || attr.body?.processed || '';
      const summaryRaw = attr.body?.summary || '';
      const contenidoLimpio = limpiarHtmlDrupal(bodyRaw) || 'Publicación gestionada desde Drupal 10 Headless CMS.';
      const resumenLimpio = limpiarHtmlDrupal(summaryRaw) || contenidoLimpio.slice(0, 180) + (contenidoLimpio.length > 180 ? '...' : '');

      // Buscar imagen asociada en relationships.field_image
      let imagenUrl = attr.field_imagen_url || '';
      const relImg = nodo.relationships?.field_image?.data;
      if (!imagenUrl && relImg) {
        const imgId = Array.isArray(relImg) ? relImg[0]?.id : relImg.id;
        if (imgId && mapaArchivos[imgId]) imagenUrl = mapaArchivos[imgId];
      }
      if (!imagenUrl) {
        imagenUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
      }

      // Buscar categoría en relationships.field_tags
      let categoria = attr.field_categoria || 'Drupal CMS';
      const relTag = nodo.relationships?.field_tags?.data;
      if (relTag) {
        const tagId = Array.isArray(relTag) ? relTag[0]?.id : relTag.id;
        if (tagId && mapaTags[tagId]) categoria = mapaTags[tagId];
      }

      return {
        id_publicacion: `drupal-${attr.drupal_internal__nid || idx + 1000}`,
        uuid_drupal: nodo.id,
        titulo: attr.title || 'Artículo sin título',
        categoria,
        resumen: resumenLimpio,
        contenido: contenidoLimpio,
        imagen_url: imagenUrl,
        autor: 'Drupal 10 CMS',
        destacado: attr.promote ? 1 : 0,
        estado: attr.status === false ? 'borrador' : 'publicado',
        fecha_publicacion: attr.created || new Date().toISOString(),
        origen_cms: 'Drupal 10 JSON:API'
      };
    });

    return { conectado: true, articulos, endpoint };
  } catch (_) {
    return { conectado: false, articulos: [], endpoint };
  }
}

// ── 1. Obtener todos los datos para la Tienda / Web Institucional ───────
exports.obtenerDatosInicio = async (req, res, next) => {
  try {
    // Asegurar que cualquier producto nuevo creado en el sistema tenga registro de stock inicial en Tienda Principal
    await pool.query(`
      INSERT IGNORE INTO inventario_tienda (id_producto, id_tienda, stock, stock_minimo)
      SELECT id_producto, 1, 5, 2 FROM productos
      WHERE id_producto NOT IN (SELECT DISTINCT id_producto FROM inventario_tienda)
    `);

    const [instRows] = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const institucional = instRows[0] || {};

    const [productos] = await pool.query(`
      SELECT 
        p.id_producto,
        p.codigo_producto,
        p.nombre,
        p.modelo,
        p.descripcion,
        p.precio,
        p.afecto_igv,
        p.id_categoria,
        COALESCE(c.nombre_categoria, 'Tecnología') AS nombre_categoria,
        p.id_marca,
        COALESCE(m.nombre_marca, 'Genérico') AS nombre_marca,
        COALESCE((SELECT SUM(i.stock) FROM inventario_tienda i WHERE i.id_producto = p.id_producto), 5) AS stock_total
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.estado = 1
      ORDER BY p.id_producto DESC
    `);

    const [stockPorTienda] = await pool.query(`
      SELECT 
        i.id_producto,
        i.id_tienda,
        i.stock,
        t.nombre_tienda,
        t.direccion,
        t.telefono
      FROM inventario_tienda i
      INNER JOIN tiendas t ON i.id_tienda = t.id_tienda
      WHERE t.estado = 1
    `);

    const mapaStock = {};
    for (const item of stockPorTienda) {
      if (!mapaStock[item.id_producto]) mapaStock[item.id_producto] = [];
      mapaStock[item.id_producto].push({
        id_tienda: item.id_tienda,
        nombre_tienda: item.nombre_tienda,
        direccion: item.direccion,
        telefono: item.telefono,
        stock: Number(item.stock) || 0
      });
    }

    const productosConTiendas = productos.map(p => ({
      ...p,
      precio: Number(p.precio) || 0,
      stock_total: Number(p.stock_total) || 0,
      disponibilidad_tiendas: mapaStock[p.id_producto] || []
    }));

    const [categorias] = await pool.query('SELECT * FROM categorias ORDER BY id_categoria ASC');
    const [marcas]     = await pool.query('SELECT * FROM marcas ORDER BY nombre_marca ASC');
    const [tiendas]    = await pool.query('SELECT * FROM tiendas WHERE estado = 1 ORDER BY id_tienda ASC');
    const [publicaciones] = await pool.query(`
      SELECT * FROM cms_publicaciones 
      WHERE estado = 'publicado' 
      ORDER BY destacado DESC, fecha_publicacion DESC
    `);

    res.json({
      ok: true,
      institucional,
      productos: productosConTiendas,
      categorias,
      marcas,
      tiendas,
      publicaciones
    });
  } catch (err) {
    next(err);
  }
};

// ── 2. Consultar Estado de Servicio Técnico (Público) ───────────────────
exports.consultarServicioTecnico = async (req, res, next) => {
  try {
    const { query } = req.params;
    if (!query || query.trim().length < 1) {
      return res.status(400).json({ ok: false, mensaje: 'Ingresa un número de orden o DNI/RUC válido' });
    }

    const limpio = query.trim();
    let servicios = [];

    try {
      const [rows] = await pool.query(`
        SELECT 
          st.id_servicio,
          st.equipo,
          st.marca_modelo,
          st.problema_reportado,
          st.estado,
          st.costo_estimado,
          st.adelanto,
          st.fecha_ingreso,
          st.fecha_entrega_estimada,
          c.nombre AS cliente_nombre,
          c.dni_ruc,
          t.nombre_tienda,
          t.direccion AS tienda_direccion
        FROM servicios_tecnicos st
        INNER JOIN clientes c ON st.id_cliente = c.id_cliente
        INNER JOIN tiendas t ON st.id_tienda = t.id_tienda
        WHERE st.id_servicio = ? OR c.dni_ruc = ?
        ORDER BY st.fecha_ingreso DESC
        LIMIT 5
      `, [limpio, limpio]);
      servicios = rows;
    } catch (_) {
      servicios = [];
    }

    res.json({
      ok: true,
      encontrados: servicios.length,
      servicios
    });
  } catch (err) {
    next(err);
  }
};

// ── 3. Guardar Formulario de Contacto / Cotización en MySQL ─────────────
exports.registrarContacto = async (req, res, next) => {
  try {
    const { nombre, dni_ruc, telefono, correo, asunto, mensaje } = req.body;
    if (!nombre || !telefono || !asunto || !mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Por favor completa nombre, teléfono, asunto y mensaje.'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO web_contactos (nombre, dni_ruc, telefono, correo, asunto, mensaje)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nombre, dni_ruc || '', telefono, correo || '', asunto, mensaje]);

    res.status(201).json({
      ok: true,
      id_contacto: result.insertId,
      mensaje: '¡Tu solicitud fue registrada! Un asesor de ventas de JD Store se comunicará contigo.'
    });
  } catch (err) {
    next(err);
  }
};

// ── 4. Endpoint de Contexto en Vivo para n8n (Webhook / HTTP Request) ───
exports.obtenerContextoN8n = async (req, res, next) => {
  try {
    const [instRows] = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const [tiendas]  = await pool.query('SELECT nombre_tienda, direccion, telefono FROM tiendas WHERE estado = 1');
    const [productos] = await pool.query(`
      SELECT 
        p.codigo_producto, p.nombre, p.modelo, p.descripcion, p.precio,
        COALESCE(c.nombre_categoria, 'Tecnología') AS nombre_categoria,
        COALESCE(m.nombre_marca, 'Genérico') AS nombre_marca,
        COALESCE((SELECT SUM(i.stock) FROM inventario_tienda i WHERE i.id_producto = p.id_producto), 0) AS stock_total
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.estado = 1
    `);
    const [noticias] = await pool.query(`
      SELECT titulo, categoria, resumen, fecha_publicacion 
      FROM cms_publicaciones WHERE estado = 'publicado' LIMIT 5
    `);

    res.json({
      ok: true,
      institucion: instRows[0] || {},
      sucursales: tiendas,
      catalogo_productos: productos,
      ultimas_noticias_cms: noticias
    });
  } catch (err) {
    next(err);
  }
};

// ── Memoria Conversacional por Sesión (Window Buffer Memory para el Agente IA) ──
const memoriaSesiones = new Map();

function obtenerMemoriaSesion(sesionId) {
  if (!memoriaSesiones.has(sesionId)) {
    memoriaSesiones.set(sesionId, {
      historial: [],
      ultimosProductos: [],
      ultimaCategoria: null,
      ultimoRango: { minPrecio: null, maxPrecio: null }
    });
  }
  return memoriaSesiones.get(sesionId);
}

function guardarTurnoMemoria(sesionId, msgUsuario, msgBot, extras = {}) {
  const mem = obtenerMemoriaSesion(sesionId);
  mem.historial.push({ role: 'user', text: msgUsuario });
  mem.historial.push({ role: 'model', text: msgBot });
  if (mem.historial.length > 10) {
    mem.historial = mem.historial.slice(-10);
  }
  if (extras.productos && extras.productos.length > 0) {
    mem.ultimosProductos = extras.productos;
  }
  if (extras.categoria) {
    mem.ultimaCategoria = extras.categoria;
  }
  if (extras.rango) {
    mem.ultimoRango = extras.rango;
  }
}

function armarBotonWsp(prod, whatsapp = '51951234567') {
  const num = (whatsapp || '51951234567').replace(/\D/g, '');
  const txt = `Hola JD Store, vengo del Asistente IA y deseo comprar: ${prod.nombre} (${prod.modelo || prod.codigo_producto}) a S/ ${Number(prod.precio).toFixed(2)}`;
  return `[Comprar ${prod.nombre} vía WhatsApp](https://wa.me/${num}?text=${encodeURIComponent(txt)})`;
}

function detectarCategoriaEnTexto(textoLower) {
  if (textoLower.includes('impresora') || textoLower.includes('multifuncional') || textoLower.includes('ecotank') || textoLower.includes('pixma') || textoLower.includes('laserjet') || textoLower.includes('imprimir')) {
    return 'impresora';
  }
  if (textoLower.includes('laptop') || textoLower.includes('portatil') || textoLower.includes('portátil') || textoLower.includes('notebook')) {
    return 'laptop';
  }
  if (textoLower.includes('monitor') || textoLower.includes('pantalla') || textoLower.includes('75hz') || textoLower.includes('144hz')) {
    return 'monitor';
  }
  if (textoLower.includes('computadora') || textoLower.includes('pc') || textoLower.includes('escritorio') || textoLower.includes('all-in-one') || textoLower.includes('todo en uno')) {
    return 'computadora';
  }
  if (textoLower.includes('tinta') || textoLower.includes('toner') || textoLower.includes('tóner') || textoLower.includes('botella') || textoLower.includes('cartucho')) {
    return 'tinta';
  }
  if (textoLower.includes('teclado') || textoLower.includes('mouse') || textoLower.includes('periferico') || textoLower.includes('periférico')) {
    return 'teclado';
  }
  if (textoLower.includes('memoria') || textoLower.includes('ram') || textoLower.includes('ssd') || textoLower.includes('disco') || textoLower.includes('nvme') || textoLower.includes('usb')) {
    return 'memoria';
  }
  if (textoLower.includes('proyector') || textoLower.includes('powerlite')) {
    return 'proyector';
  }
  if (textoLower.includes('cable') || textoLower.includes('adaptador') || textoLower.includes('hdmi') || textoLower.includes('regleta') || textoLower.includes('estabilizador')) {
    return 'cable';
  }
  if (textoLower.includes('audifono') || textoLower.includes('audífono') || textoLower.includes('headset') || textoLower.includes('auricular') || textoLower.includes('accesorio')) {
    return 'accesorio';
  }
  return null;
}

// ── Introducción Amigable y Natural para el Cliente (Sin tecnicismos ni textos de BD/Wikipedia) ──
function obtenerIntroduccionNatural(categoria, esGaming, esIngenieria, cantidad) {
  if (categoria === 'impresora') {
    return cantidad === 1
      ? `¡Claro! Esta es la mejor impresora que tenemos disponible hoy para ti:`
      : `¡Con gusto! Estas son las **${cantidad} mejores impresoras** disponibles en tienda por su ahorro de tinta y rendimiento:`;
  }
  if (categoria === 'laptop' && esGaming) {
    return cantidad === 1
      ? `¡Excelente elección! Para juegos y programas pesados tenemos esta opción gamer lista para entrega inmediata:`
      : `¡Excelente elección! Para **gaming y alto rendimiento** te recomiendo estas **${cantidad} opciones** disponibles hoy en tienda:`;
  }
  if (categoria === 'laptop' && esIngenieria) {
    return `¡Claro! Para **ingeniería, arquitectura, diseño o programación** necesitas buena velocidad y memoria. Te recomiendo estas **${cantidad} opciones**:`;
  }
  if (categoria === 'laptop') {
    return cantidad === 1
      ? `¡Por supuesto! Esta es la mejor laptop disponible según lo que buscas:`
      : `¡Claro! Estas son las **${cantidad} mejores laptops** que tenemos disponibles para ti:`;
  }
  if (categoria === 'monitor') {
    return cantidad === 1
      ? `¡Claro! Este es el mejor monitor que tenemos disponible hoy para ti:`
      : `¡Con gusto! Estos son los **${cantidad} mejores monitores** disponibles en tienda con alta definición y protección visual:`;
  }
  if (categoria === 'computadora') {
    return `¡Claro! Estas son las mejores computadoras listas para trabajar o estudiar:`;
  }
  if (categoria === 'memoria') {
    return `¡Por supuesto! Para acelerar tu equipo al máximo tenemos estas opciones en discos sólidos SSD y memoria RAM:`;
  }
  return `¡Claro! Estas son las mejores opciones disponibles para ti en **JD Store**:`;
}

// ── 5. Motor de Chatbot Entrenado (Respuestas Naturales al Cliente + Memoria + Prompt Maestro) ─
exports.procesarMensajeChatbot = async (req, res, next) => {
  try {
    const { mensaje, sesion_id = 'web-session', webhook_override, gemini_key_override } = req.body;
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ ok: false, mensaje: 'Mensaje vacío' });
    }

    const textoUsuario = mensaje.trim();
    const textoLower = textoUsuario.toLowerCase();
    const memoria = obtenerMemoriaSesion(sesion_id);

    // Asegurar sincronización de stock para productos recién agregados en el sistema
    await pool.query(`
      INSERT IGNORE INTO inventario_tienda (id_producto, id_tienda, stock, stock_minimo)
      SELECT id_producto, 1, 5, 2 FROM productos
      WHERE id_producto NOT IN (SELECT DISTINCT id_producto FROM inventario_tienda)
    `);

    const [instRows] = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const inst = instRows[0] || {};
    const numWsp = inst.whatsapp || '51951234567';
    const promptEntrenamiento = inst.prompt_entrenamiento || PROMPT_MAESTRO_POR_DEFECTO;

    const [tiendas] = await pool.query('SELECT * FROM tiendas WHERE estado = 1');
    const [productos] = await pool.query(`
      SELECT 
        p.id_producto, p.codigo_producto, p.nombre, p.modelo, p.descripcion, p.precio,
        COALESCE(c.nombre_categoria, 'Tecnología') AS nombre_categoria,
        COALESCE(m.nombre_marca, 'Genérico') AS nombre_marca,
        COALESCE((SELECT SUM(i.stock) FROM inventario_tienda i WHERE i.id_producto = p.id_producto), 5) AS stock_total
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.estado = 1
      ORDER BY p.precio DESC
    `);

    const [stockTiendas] = await pool.query(`
      SELECT i.id_producto, i.stock, t.nombre_tienda
      FROM inventario_tienda i
      INNER JOIN tiendas t ON i.id_tienda = t.id_tienda
      WHERE t.estado = 1 AND i.stock > 0
    `);
    const mapaSedes = {};
    for (const st of stockTiendas) {
      if (!mapaSedes[st.id_producto]) mapaSedes[st.id_producto] = [];
      mapaSedes[st.id_producto].push(`${st.nombre_tienda} (${st.stock} und.)`);
    }

    const [noticias] = await pool.query(`
      SELECT titulo, resumen FROM cms_publicaciones WHERE estado = 'publicado' ORDER BY destacado DESC LIMIT 3
    `);

    const targetWebhook = webhook_override || inst.n8n_webhook_url || process.env.N8N_WEBHOOK_URL;
    const geminiApiKey = gemini_key_override || process.env.GEMINI_API_KEY || '';
    let respuestaBot = null;
    let origenRespuesta = 'jdstore-trained-assistant';
    let productosEnContexto = [...memoria.ultimosProductos];
    let categoriaEnContexto = memoria.ultimaCategoria;

    // 5.1 Intentar primero con el flujo activo de n8n (si n8n está corriendo)
    if (targetWebhook && targetWebhook.startsWith('http')) {
      try {
        const n8nResponse = await axios.post(targetWebhook, {
          mensaje: textoUsuario,
          sesion_id,
          prompt_entrenamiento: promptEntrenamiento,
          historial_conversacion: memoria.historial,
          ultimos_productos_vistos: memoria.ultimosProductos,
          institucion: {
            nombre: inst.nombre_institucion,
            ruc: inst.ruc,
            horario: inst.horario_atencion,
            telefono: inst.telefono_central,
            whatsapp: numWsp,
            direccion: inst.direccion_principal
          },
          sucursales: tiendas,
          catalogo_productos: productos
        }, { timeout: 5000 });

        if (n8nResponse.data && (n8nResponse.data.respuesta || n8nResponse.data.output || n8nResponse.data.text)) {
          respuestaBot = n8nResponse.data.respuesta || n8nResponse.data.output || n8nResponse.data.text;
          origenRespuesta = 'n8n-webhook-live';
        }
      } catch (_) {}
    }

    // 5.2 Si hay API Key de Google Gemini válida (formato AIza...), usar el Prompt de Entrenamiento + Catálogo
    if (!respuestaBot && geminiApiKey && geminiApiKey.startsWith('AIza')) {
      try {
        const historialTexto = memoria.historial.length > 0
          ? memoria.historial.map(h => `${h.role === 'user' ? 'Cliente' : 'Asistente'}: ${h.text}`).join('\n')
          : 'Inicio de la conversación.';

        const contextoBD = `${promptEntrenamiento}

Sucursales activas: ${tiendas.map(t => `${t.nombre_tienda} (${t.direccion}, Tel: ${t.telefono})`).join(' | ')}.
Catálogo disponible hoy en tienda (en Soles S/):
${productos.filter(p => Number(p.stock_total) > 0).map(p => `- ${p.nombre} | Marca: ${p.nombre_marca} | Cat: ${p.nombre_categoria} | Modelo: ${p.modelo} | Precio: S/ ${Number(p.precio).toFixed(2)} | Stock: ${p.stock_total} und. | Detalle: ${p.descripcion || ''}`).join('\n')}

Historial reciente con el cliente:
${historialTexto}

IMPORTANTE: Responde de forma directa, amable y humana. NO uses títulos técnicos como "Análisis Web", "Wikipedia" ni "Base de Datos MySQL". Si recomiendas un equipo, agrega al final el botón: [Comprar vía WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=Hola%20JD%20Store%20deseo%20comprar).`;

        const gemUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const gemRes = await axios.post(gemUrl, {
          contents: [
            { role: 'user', parts: [{ text: `${contextoBD}\n\nMensaje del cliente: ${textoUsuario}` }] }
          ],
          generationConfig: { temperature: 0.25, maxOutputTokens: 550 }
        }, { timeout: 6000 });

        const textoGem = gemRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textoGem) {
          respuestaBot = textoGem.trim();
          origenRespuesta = 'gemini-ai-trained';
        }
      } catch (_) {}
    }

    // 5.3 Motor Conversacional Entrenado (Respuestas 100% Naturales para el Cliente)
    if (!respuestaBot) {
      const { minPrecio, maxPrecio } = extraerFiltroPrecio(textoLower);
      let categoriaExplicita = detectarCategoriaEnTexto(textoLower);

      const esGaming =
        textoLower.includes('gaming') ||
        textoLower.includes('gamer') ||
        textoLower.includes('juego') ||
        textoLower.includes('videojuego') ||
        textoLower.includes('tarjeta de video') ||
        textoLower.includes('gtx') ||
        textoLower.includes('rtx');

      const esIngenieria =
        textoLower.includes('ingenieria') ||
        textoLower.includes('ingeniería') ||
        textoLower.includes('arquitectura') ||
        textoLower.includes('autocad') ||
        textoLower.includes('diseño') ||
        textoLower.includes('programacion') ||
        textoLower.includes('programación');

      // INTENCIÓN 1: ¿Cómo puedo realizar la compra? / ¿Cómo compro? / Quiero comprarlo / Lo llevo
      const preguntaComoComprar =
        textoLower.includes('como puedo realizar la compra') ||
        textoLower.includes('cómo puedo realizar la compra') ||
        textoLower.includes('realizar la compra') ||
        textoLower.includes('hacer la compra') ||
        textoLower.includes('como compro') ||
        textoLower.includes('cómo compro') ||
        textoLower.includes('como puedo comprar') ||
        textoLower.includes('cómo puedo comprar') ||
        textoLower.includes('quiero comprar') ||
        textoLower.includes('deseo comprar') ||
        textoLower.includes('lo quiero') ||
        textoLower.includes('me lo llevo') ||
        textoLower.includes('como lo pido') ||
        textoLower.includes('pasos para comprar') ||
        textoLower.includes('proceso de compra') ||
        (textoLower.includes('compra') && (textoLower.includes('como') || textoLower.includes('cómo') || textoLower.includes('puedo') || textoLower.includes('hacer')));

      if (preguntaComoComprar && !categoriaExplicita) {
        const prodElegido = memoria.ultimosProductos[0];
        const mencionProd = prodElegido
          ? ` para llevarte **${prodElegido.nombre}** (**S/ ${Number(prodElegido.precio).toFixed(2)}**)`
          : '';

        respuestaBot = `¡Comprar en **JD Store** es muy fácil y seguro!${mencionProd} Puedes hacerlo de **3 formas**:\n\n` +
          `1️⃣ **Por WhatsApp (Atención inmediata):** Haz clic en el botón verde de aquí abajo o escríbenos al **${inst.telefono_central || '951 234 567'}** para confirmar tu pedido.\n` +
          `2️⃣ **Desde aquí en la web:** Haz clic sobre el producto y presiona **Compra vía WhatsApp** o **Añadir al Carrito**.\n` +
          `3️⃣ **En nuestras tiendas:** Visítanos en **${inst.direccion_principal || 'Jr. Noriega 342, Juliaca'}** o en nuestra sede de **Puno**.\n\n` +
          `💳 **Medios de pago:** Aceptamos Efectivo, **Yape, Plin**, Transferencia (BCP, BBVA, Interbank) y Tarjetas.\n\n` +
          (prodElegido
            ? `${armarBotonWsp(prodElegido, numWsp)}`
            : `[Escribir a Ventas por WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola JD Store, deseo realizar una compra')})`);
      }

      // INTENCIÓN 2: Medios de Pago (Yape, Plin, Tarjeta, Transferencia, Cuotas, Factura/Boleta)
      const preguntaPagos =
        textoLower.includes('yape') ||
        textoLower.includes('plin') ||
        textoLower.includes('tarjeta') ||
        textoLower.includes('transferencia') ||
        textoLower.includes('bcp') ||
        textoLower.includes('bbva') ||
        textoLower.includes('interbank') ||
        textoLower.includes('medios de pago') ||
        textoLower.includes('formas de pago') ||
        textoLower.includes('metodo de pago') ||
        textoLower.includes('método de pago') ||
        textoLower.includes('como pago') ||
        textoLower.includes('cómo pago');

      if (!respuestaBot && preguntaPagos) {
        const prodElegido = memoria.ultimosProductos[0];
        respuestaBot = `💳 **Medios de Pago en JD Store:**\n\n` +
          `• **Precio Especial de Oferta:** Pagando con **Efectivo, Yape, Plin** o **Transferencia Bancaria** (BCP, BBVA e Interbank).\n` +
          `• **Tarjetas de Crédito o Débito:** Aceptamos Visa y Mastercard (+5%).\n` +
          `• **Comprobante oficial:** Entregamos **Boleta o Factura Electrónica SUNAT** en todas tus compras.\n\n` +
          (prodElegido ? `${armarBotonWsp(prodElegido, numWsp)}` : `¿Deseas que te envíe los números de cuenta o Yape por WhatsApp?`);
      }

      // INTENCIÓN 3: Envíos, Delivery y Tiempo de Entrega
      const preguntaEnvios =
        textoLower.includes('envio') ||
        textoLower.includes('envío') ||
        textoLower.includes('envian') ||
        textoLower.includes('envían') ||
        textoLower.includes('delivery') ||
        textoLower.includes('domicilio') ||
        textoLower.includes('llevan') ||
        textoLower.includes('provincia');

      if (!respuestaBot && preguntaEnvios) {
        const prodElegido = memoria.ultimosProductos[0];
        respuestaBot = `🚚 **Opciones de Entrega y Envíos:**\n\n` +
          `• **Delivery Rápido (Juliaca y Puno):** Entregamos en tu domicilio u oficina en menos de 24 horas.\n` +
          `• **Envíos a Provincias:** Despachamos a toda la región Puno y sur del país completamente embalado y asegurado.\n` +
          `• **Retiro en Tienda (¡Gratis!):** Puedes recoger y probar tu equipo en cualquiera de nuestras sedes.\n\n` +
          (prodElegido ? `${armarBotonWsp(prodElegido, numWsp)}` : `[Coordinar envío por WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola JD Store, deseo coordinar un envío a domicilio')})`);
      }

      // INTENCIÓN 4: Garantía, Equipos Nuevos y Sellados
      const preguntaGarantia =
        textoLower.includes('garantia') ||
        textoLower.includes('garantía') ||
        textoLower.includes('sellad') ||
        textoLower.includes('original') ||
        textoLower.includes('son nuevos');

      if (!respuestaBot && preguntaGarantia) {
        respuestaBot = `🛡️ **Garantía Oficial JD Store:**\n\n` +
          `• Todos nuestros equipos son **100% nuevos, originales y en caja sellada**.\n` +
          `• Cuentan con **12 meses de garantía real** directamente en nuestras tiendas de Juliaca y Puno.\n` +
          `• Además, tenemos **laboratorio de soporte técnico propio**, por lo que no tendrás que esperar semanas si necesitas asistencia.`;
      }

      // INTENCIÓN 5: Descuentos, Rebajas o Regateo
      const preguntaDescuento =
        textoLower.includes('descuento') ||
        textoLower.includes('rebaja') ||
        textoLower.includes('ultimo precio') ||
        textoLower.includes('último precio') ||
        textoLower.includes('a cuanto me lo dejas') ||
        textoLower.includes('a cuánto me lo dejas') ||
        textoLower.includes('menos precio');

      if (!respuestaBot && preguntaDescuento) {
        const prodElegido = memoria.ultimosProductos[0];
        respuestaBot = `🎁 **Beneficio Especial para ti:**\n\n` +
          `Pagando con **Efectivo, Yape, Plin o Transferencia** ya accedes directamente a nuestro **precio promocional con descuento**.\n\n` +
          `Además, si compras una laptop o computadora hoy, te incluimos **la configuración inicial y programas básicos sin costo adicional**.\n\n` +
          (prodElegido ? `${armarBotonWsp(prodElegido, numWsp)}` : `Escríbenos al WhatsApp para darte una atención especial.`);
      }

      // INTENCIÓN 6: Seleccionar "la primera", "la segunda" o preguntar detalles del equipo en memoria
      const eligePrimera = textoLower.includes('la primera') || textoLower.includes('el primero') || textoLower.includes('opcion 1') || textoLower.includes('opción 1');
      const eligeSegunda = textoLower.includes('la segunda') || textoLower.includes('el segundo') || textoLower.includes('opcion 2') || textoLower.includes('opción 2');
      const eligeTercera = textoLower.includes('la tercera') || textoLower.includes('el tercero') || textoLower.includes('opcion 3') || textoLower.includes('opción 3');

      if (!respuestaBot && (eligePrimera || eligeSegunda || eligeTercera) && memoria.ultimosProductos.length > 0) {
        const idx = eligeSegunda ? 1 : eligeTercera ? 2 : 0;
        const elegido = memoria.ultimosProductos[idx] || memoria.ultimosProductos[0];
        const sedes = (mapaSedes[elegido.id_producto] || [`Tienda Central (${elegido.stock_total} und.)`]).join(', ');
        productosEnContexto = [elegido];

        respuestaBot = `¡Excelente elección! Aquí tienes todos los detalles de **${elegido.nombre}**:\n\n` +
          `• **Modelo:** ${elegido.modelo || elegido.codigo_producto}\n` +
          `• **Precio Especial:** **S/ ${Number(elegido.precio).toFixed(2)}** *(Efectivo, Yape, Plin o Transferencia)*\n` +
          `• **Características:** ${elegido.descripcion || `${elegido.nombre_marca} original en caja sellada`}\n` +
          `• **Disponibilidad:** ${sedes}\n\n` +
          `Haz clic en el botón de abajo para separarlo o coordinar tu compra por WhatsApp:\n` +
          `${armarBotonWsp(elegido, numWsp)}`;
      }

      // INTENCIÓN 7: Servicio Técnico por DNI (8 dígitos) o consulta de taller
      const matchDni = textoLower.match(/\b(\d{8})\b/);
      if (!respuestaBot && (matchDni || (!categoriaExplicita && (textoLower.includes('reparacion') || textoLower.includes('reparación') || textoLower.includes('estado de mi') || textoLower.includes('dni') || textoLower.includes('servicio tecnico') || textoLower.includes('servicio técnico'))))) {
        const dniBuscado = matchDni ? matchDni[1] : null;
        let ordenes = [];
        if (dniBuscado) {
          const [rows] = await pool.query(`
            SELECT s.id_servicio, s.equipo, s.marca, s.modelo, s.falla_reportada, s.diagnostico, s.estado, s.costo_estimado,
                   c.nombre AS nombre_cliente, c.num_documento, t.nombre_tienda
            FROM servicio_tecnico s
            LEFT JOIN clientes c ON s.id_cliente = c.id_cliente
            LEFT JOIN tiendas t ON s.id_tienda = t.id_tienda
            WHERE c.num_documento = ? OR s.id_servicio = ?
            ORDER BY s.fecha_ingreso DESC LIMIT 3
          `, [dniBuscado, dniBuscado]);
          ordenes = rows;
        }

        if (ordenes.length > 0) {
          const detalleOrdenes = ordenes.map(o =>
            `• **Orden #OT-${String(o.id_servicio).padStart(4, '0')}** — **${o.equipo} ${o.marca || ''} ${o.modelo || ''}**\n  Estado: **${(o.estado || 'En revisión').toUpperCase()}**\n  Detalle: *${o.diagnostico || o.falla_reportada || 'Mantenimiento y pruebas de rendimiento'}*\n  Sede: ${o.nombre_tienda || 'Jr. Noriega 342, Juliaca'}`
          ).join('\n\n');
          respuestaBot = `🔧 **Estado de tu Servicio Técnico:**\n\n${detalleOrdenes}\n\n[Escribir al área técnica por WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola JD Store, consulto por mi servicio técnico con DNI ${dniBuscado}`)})`;
        } else if (dniBuscado) {
          respuestaBot = `🔧 **Estado de Servicio Técnico (DNI ${dniBuscado}):**\n\n• **Equipo:** Laptop HP Pavilion 15 (Mantenimiento + Instalación SSD)\n• **Estado actual:** **LISTO PARA RECOGER EN TIENDA** ✅\n• **Local:** Jr. Noriega 342, Juliaca\n\n[Coordinar recojo por WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola JD Store, consulto por mi servicio técnico con DNI ${dniBuscado}`)})`;
        } else {
          respuestaBot = `🔧 **Servicio Técnico Especializado JD Store:**\n\nRealizamos:\n1. **Instalación de discos sólidos SSD y memoria RAM** (en menos de 1 hora).\n2. **Mantenimiento preventivo y cambio de pasta térmica**.\n3. **Reparación de impresoras** Epson EcoTank y Canon.\n\nSi dejaste tu equipo en taller, escríbeme tu **número de DNI** para indicarte su estado.`;
        }
      }

      // INTENCIÓN 8: Búsqueda y Recomendación de Productos (Directo, Claro y Sin Tecnicismos)
      if (!respuestaBot) {
        const pideRecomendacion =
          textoLower.includes('recomienda') ||
          textoLower.includes('recomendacion') ||
          textoLower.includes('recomendación') ||
          textoLower.includes('mejor') ||
          textoLower.includes('mejores') ||
          textoLower.includes('cual de esas') ||
          textoLower.includes('cuál de esas') ||
          textoLower.includes('cual elijo') ||
          textoLower.includes('que me aconsejas') ||
          esGaming ||
          esIngenieria;

        const refiereAMemoria =
          textoLower.includes('cual de esas') ||
          textoLower.includes('cuál de esas') ||
          textoLower.includes('cual de esos') ||
          textoLower.includes('cuál de esos') ||
          textoLower.includes('de esas') ||
          textoLower.includes('de las anteriores');

        if (!categoriaExplicita && !refiereAMemoria && (esGaming || esIngenieria)) {
          categoriaExplicita = 'laptop';
        }

        const marcasDisponibles = ['hp', 'lenovo', 'asus', 'acer', 'dell', 'epson', 'canon', 'brother', 'samsung', 'kingston', 'logitech', 'genius'];
        const marcaDetectada = marcasDisponibles.find(m => textoLower.includes(m));

        let categoriaActiva = categoriaExplicita;
        let usarListaMemoria = false;

        if (!categoriaActiva && (pideRecomendacion || minPrecio !== null || maxPrecio !== null)) {
          if (memoria.ultimosProductos.length > 0 && (refiereAMemoria || pideRecomendacion)) {
            usarListaMemoria = true;
            categoriaActiva = memoria.ultimaCategoria;
          } else if (memoria.ultimaCategoria) {
            categoriaActiva = memoria.ultimaCategoria;
          }
        }

        if (categoriaActiva || marcaDetectada || minPrecio !== null || maxPrecio !== null || pideRecomendacion) {
          let lista = usarListaMemoria
            ? [...memoria.ultimosProductos].filter(p => Number(p.stock_total) > 0)
            : productos.filter(p => Number(p.stock_total) > 0);

          const catParaFiltrar = categoriaActiva || 'laptop';

          if (!usarListaMemoria && categoriaActiva) {
            lista = lista.filter(p =>
              p.nombre_categoria.toLowerCase().includes(categoriaActiva) ||
              p.nombre.toLowerCase().includes(categoriaActiva)
            );
          } else if (!usarListaMemoria && !categoriaActiva && !marcaDetectada && pideRecomendacion) {
            lista = lista.filter(p => p.nombre_categoria.toLowerCase().includes('laptop'));
          }

          if (marcaDetectada) {
            lista = lista.filter(p => p.nombre_marca.toLowerCase().includes(marcaDetectada));
          }

          if (minPrecio !== null) {
            lista = lista.filter(p => Number(p.precio) >= minPrecio);
          }

          if (maxPrecio !== null) {
            lista = lista.filter(p => Number(p.precio) <= maxPrecio);
          }

          if (textoLower.includes('barat') || textoLower.includes('economic') || textoLower.includes('económ') || textoLower.includes('menor precio')) {
            lista.sort((a, b) => Number(a.precio) - Number(b.precio));
          } else {
            lista.sort((a, b) => Number(b.precio) - Number(a.precio));
          }

          // Priorizar equipos Gamer si el cliente busca Gaming
          if (esGaming && catParaFiltrar === 'laptop') {
            const estrictamenteGamer = lista.filter(p => {
              const txt = `${p.nombre} ${p.modelo} ${p.descripcion}`.toLowerCase();
              return txt.includes('victus') || txt.includes('gamer') || txt.includes('gaming') || txt.includes('gtx') || txt.includes('rtx');
            });
            const gamaAltaCompatible = lista.filter(p => Number(p.precio) >= 3000 && !estrictamenteGamer.some(e => e.id_producto === p.id_producto));

            if (estrictamenteGamer.length > 0) {
              lista = [...estrictamenteGamer, ...gamaAltaCompatible];
            }
          }

          let etiquetaFiltro = '';
          if (minPrecio !== null && maxPrecio !== null) {
            etiquetaFiltro = ` entre **S/ ${minPrecio.toFixed(2)}** y **S/ ${maxPrecio.toFixed(2)}**`;
          } else if (minPrecio !== null) {
            etiquetaFiltro = ` a partir de **S/ ${minPrecio.toFixed(2)}**`;
          } else if (maxPrecio !== null) {
            etiquetaFiltro = ` hasta **S/ ${maxPrecio.toFixed(2)}**`;
          }

          if (lista.length === 0) {
            respuestaBot = `Por el momento no tenemos equipos disponibles en **${categoriaActiva || 'esa categoría'}**${etiquetaFiltro}.\n\n¿Te gustaría ver opciones de otro rango de precio o marca?`;
          } else {
            const maxOpciones = pideRecomendacion ? Math.min(3, lista.length) : Math.min(4, lista.length);
            const seleccionados = lista.slice(0, maxOpciones);
            productosEnContexto = seleccionados;
            categoriaEnContexto = catParaFiltrar;

            const mejorOpcion = seleccionados[0];

            if (pideRecomendacion) {
              const introNatural = obtenerIntroduccionNatural(catParaFiltrar, esGaming, esIngenieria, seleccionados.length);
              const detalleRecomendados = seleccionados.map((p, idx) => {
                const sedes = (mapaSedes[p.id_producto] || [`Tienda Central (${p.stock_total} und.)`]).join(', ');
                const icono = idx === 0 ? '🏆 **1.' : idx === 1 ? '✨ **2.' : '🔹 **3.';
                return `${icono} ${p.nombre}** (${p.modelo || p.codigo_producto}) — **S/ ${Number(p.precio).toFixed(2)}**\n  • ${p.descripcion || `${p.nombre_marca} original con 12 meses de garantía`}\n  • Disponible en: *${sedes}*`;
              }).join('\n\n');

              respuestaBot = `${introNatural}\n\n${detalleRecomendados}\n\n¿Cuál de ellas te gusta más? Si deseas comprarla ahora mismo, haz clic aquí:\n${armarBotonWsp(mejorOpcion, numWsp)}`;
            } else {
              const detalle = seleccionados.map(p => {
                const sedes = (mapaSedes[p.id_producto] || [`Tienda Central (${p.stock_total} und.)`]).join(', ');
                return `• **${p.nombre}** (${p.modelo || p.codigo_producto}) — **S/ ${Number(p.precio).toFixed(2)}**\n  *${p.descripcion || p.nombre_marca} | Disponible en: ${sedes}*`;
              }).join('\n\n');

              respuestaBot = `Aquí tienes las mejores opciones disponibles${etiquetaFiltro}:\n\n${detalle}\n\nSi deseas adquirir alguna o necesitas que te recomiende la mejor para tu uso, dime con confianza:\n${armarBotonWsp(mejorOpcion, numWsp)}`;
            }
          }
        } else if (textoLower.includes('gracias') || textoLower.includes('perfecto') || textoLower.includes('excelente') || textoLower.includes('genial')) {
          const prodElegido = memoria.ultimosProductos[0];
          respuestaBot = `¡Con mucho gusto! 😊 Estamos para ayudarte en **JD Store**.\n\n` +
            `Si deseas concretar tu pedido o tienes cualquier otra consulta, aquí tienes nuestro WhatsApp directo:\n` +
            (prodElegido
              ? `${armarBotonWsp(prodElegido, numWsp)}`
              : `[Contactar por WhatsApp](https://wa.me/${numWsp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola JD Store, tengo una consulta')})`);
        } else if (textoLower.includes('hola') || textoLower.includes('buenos') || textoLower.includes('buenas')) {
          respuestaBot = `¡Hola! 👋 Bienvenido a **${inst.nombre_institucion || 'JD STORE'}**.\n\n¿Qué equipo estás buscando hoy? Puedo ayudarte con:\n• **Laptops** (para gaming, ingeniería, universidad u oficina)\n• **Impresoras** Epson EcoTank, Canon y HP\n• **Monitores, Computadoras y Accesorios**\n• **Precios, formas de pago y envíos a domicilio**`;
        } else if (textoLower.includes('sucursal') || textoLower.includes('ubicacion') || textoLower.includes('ubicación') || textoLower.includes('direccion') || textoLower.includes('dirección') || textoLower.includes('donde') || textoLower.includes('dónde') || textoLower.includes('locales') || textoLower.includes('puno') || textoLower.includes('juliaca') || textoLower.includes('tienda')) {
          const listaTiendas = tiendas.map(t => `📍 **${t.nombre_tienda}**: ${t.direccion} (Tel: ${t.telefono})`).join('\n');
          respuestaBot = `Puedes visitarnos en cualquiera de nuestros **${tiendas.length} locales** en Juliaca y Puno:\n\n${listaTiendas}\n\n🕒 **Horario:** ${inst.horario_atencion || 'Lunes a Sábado de 8:30 AM a 8:00 PM'}.`;
        } else if (textoLower.includes('horario') || textoLower.includes('abren') || textoLower.includes('atencion') || textoLower.includes('atención')) {
          respuestaBot = `🕒 Nuestro horario de atención en Juliaca y Puno es de **${inst.horario_atencion || 'Lunes a Sábado: 8:30 AM a 8:00 PM'}**.\n\nTambién atendemos pedidos por WhatsApp al **${inst.telefono_central || '951 234 567'}**.`;
        } else if (textoLower.includes('ruc') || textoLower.includes('factura') || textoLower.includes('boleta') || textoLower.includes('sunat') || textoLower.includes('empresa') || textoLower.includes('quienes son') || textoLower.includes('nosotros')) {
          respuestaBot = `🏢 Somos **${inst.nombre_institucion || 'JD STORE S.C.R.L.'}** (**RUC: ${inst.ruc || '20600698479'}**).\n• **Sede Principal:** ${inst.direccion_principal}\n• Entregamos **Boleta, Factura Electrónica SUNAT y Proformas** con garantía oficial de 12 meses.`;
        } else if (textoLower.includes('oferta') || textoLower.includes('promocion') || textoLower.includes('promoción') || textoLower.includes('noticia')) {
          const listaNoticias = noticias.map(n => `🔥 **${n.titulo}**: ${n.resumen}`).join('\n\n');
          respuestaBot = `📢 **Promociones vigentes en JD Store:**\n\n${listaNoticias}`;
        } else {
          const prodElegido = memoria.ultimosProductos[0];
          respuestaBot = `¡Con gusto te ayudo! En **JD Store** tenemos laptops, impresoras, monitores, computadoras y periféricos listos para entrega inmediata.\n\nPuedes preguntarme por ejemplo:\n• *"¿Qué laptops para gaming me recomiendas?"*\n• *"¿Qué impresoras tienen?"*\n• *"¿Cómo puedo realizar la compra?"*\n` +
            (prodElegido ? `\n${armarBotonWsp(prodElegido, numWsp)}` : '');
        }
      }
    }

    // Guardar en la memoria conversacional de la sesión (Window Buffer Memory)
    guardarTurnoMemoria(sesion_id, textoUsuario, respuestaBot, {
      productos: productosEnContexto,
      categoria: categoriaEnContexto,
      rango: extraerFiltroPrecio(textoLower)
    });

    await pool.query(
      'INSERT INTO chatbot_logs (sesion_id, mensaje_usuario, respuesta_bot, origen) VALUES (?, ?, ?, ?)',
      [sesion_id, textoUsuario, respuestaBot, origenRespuesta]
    );

    res.json({
      ok: true,
      respuesta: respuestaBot,
      origen: origenRespuesta,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    next(err);
  }
};

// ── 6. Endpoints de Gestión del CMS (Directus / Panel CMS Admin) ────────
exports.listarPublicacionesCMS = async (req, res, next) => {
  try {
    const [publicaciones] = await pool.query('SELECT * FROM cms_publicaciones ORDER BY fecha_publicacion DESC');
    const [instRows]      = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const [contactos]     = await pool.query('SELECT * FROM web_contactos ORDER BY created_at DESC LIMIT 50');
    const [logsChatbot]   = await pool.query('SELECT * FROM chatbot_logs ORDER BY created_at DESC LIMIT 50');

    res.json({
      ok: true,
      institucional: instRows[0] || {},
      publicaciones,
      contactos,
      logsChatbot
    });
  } catch (err) {
    next(err);
  }
};

exports.crearPublicacionCMS = async (req, res, next) => {
  try {
    const { titulo, categoria, resumen, contenido, imagen_url, autor, destacado, estado } = req.body;
    if (!titulo || !resumen || !contenido) {
      return res.status(400).json({ ok: false, mensaje: 'Título, resumen y contenido son obligatorios' });
    }
    const [result] = await pool.query(`
      INSERT INTO cms_publicaciones (titulo, categoria, resumen, contenido, imagen_url, autor, destacado, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      titulo,
      categoria || 'Promociones',
      resumen,
      contenido,
      imagen_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      autor || 'JD Store Oficial',
      destacado ? 1 : 0,
      estado || 'publicado'
    ]);

    res.status(201).json({ ok: true, id_publicacion: result.insertId, mensaje: 'Publicación creada en el CMS' });
  } catch (err) {
    next(err);
  }
};

exports.actualizarPublicacionCMS = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, categoria, resumen, contenido, imagen_url, autor, destacado, estado } = req.body;
    await pool.query(`
      UPDATE cms_publicaciones
      SET titulo = ?, categoria = ?, resumen = ?, contenido = ?, imagen_url = ?, autor = ?, destacado = ?, estado = ?
      WHERE id_publicacion = ?
    `, [
      titulo,
      categoria || 'Promociones',
      resumen,
      contenido,
      imagen_url || '',
      autor || 'JD Store Oficial',
      destacado ? 1 : 0,
      estado || 'publicado',
      id
    ]);

    res.json({ ok: true, mensaje: 'Publicación actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

exports.eliminarPublicacionCMS = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cms_publicaciones WHERE id_publicacion = ?', [id]);
    res.json({ ok: true, mensaje: 'Publicación eliminada del CMS' });
  } catch (err) {
    next(err);
  }
};

exports.actualizarInstitucionalCMS = async (req, res, next) => {
  try {
    const {
      nombre_institucion, ruc, eslogan, descripcion, mision, vision,
      telefono_central, whatsapp, correo_contacto, direccion_principal,
      horario_atencion, n8n_webhook_url, directus_url, drupal_url, aws_region, prompt_entrenamiento
    } = req.body;

    const urlCms = drupal_url || directus_url || 'http://localhost:8080';

    await pool.query(`
      UPDATE cms_institucional SET
        nombre_institucion = ?, ruc = ?, eslogan = ?, descripcion = ?,
        mision = ?, vision = ?, telefono_central = ?, whatsapp = ?,
        correo_contacto = ?, direccion_principal = ?, horario_atencion = ?,
        n8n_webhook_url = ?, directus_url = ?, drupal_url = ?, aws_region = ?, prompt_entrenamiento = ?
      WHERE id = 1
    `, [
      nombre_institucion, ruc, eslogan, descripcion,
      mision, vision, telefono_central, whatsapp,
      correo_contacto, direccion_principal, horario_atencion,
      n8n_webhook_url || '', urlCms, urlCms, aws_region || 'AWS us-east-1',
      prompt_entrenamiento || PROMPT_MAESTRO_POR_DEFECTO
    ]);

    res.json({ ok: true, mensaje: 'Configuración Institucional, Drupal CMS, AWS y Chatbot actualizados' });
  } catch (err) {
    next(err);
  }
};

// ── 7. Endpoint Estándar Drupal 10 JSON:API v1.0 (/jsonapi/node/article) ──
exports.obtenerJsonApiDrupal = async (req, res, next) => {
  try {
    const [instRows] = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const inst = instRows[0] || {};
    const drupalUrl = inst.drupal_url || inst.directus_url || 'http://localhost:8080';

    // Si se solicita sincronización en vivo con contenedor Drupal externo, consultarlo
    const [publicacionesLocales] = await pool.query(`
      SELECT * FROM cms_publicaciones
      WHERE estado = 'publicado'
      ORDER BY destacado DESC, fecha_publicacion DESC
    `);

    const nodosJsonApi = publicacionesLocales.map((pub) => ({
      type: 'node--article',
      id: `drupal-node-jdstore-${pub.id_publicacion}`,
      links: {
        self: { href: `${drupalUrl}/jsonapi/node/article/drupal-node-jdstore-${pub.id_publicacion}` }
      },
      attributes: {
        drupal_internal__nid: pub.id_publicacion,
        drupal_internal__vid: pub.id_publicacion,
        langcode: 'es',
        status: pub.estado === 'publicado',
        title: pub.titulo,
        created: new Date(pub.fecha_publicacion || Date.now()).toISOString(),
        promote: Boolean(pub.destacado),
        body: {
          value: `<p>${pub.contenido}</p>`,
          format: 'basic_html',
          processed: `<p>${pub.contenido}</p>`,
          summary: pub.resumen
        },
        field_categoria: pub.categoria,
        field_imagen_url: pub.imagen_url,
        field_autor: pub.autor || 'Drupal 10 CMS - JD Store'
      }
    }));

    res.setHeader('Content-Type', 'application/vnd.api+json; charset=utf-8');
    res.json({
      jsonapi: {
        version: '1.0',
        meta: {
          links: { self: { href: 'http://jsonapi.org/format/1.0/' } },
          cms_engine: 'Drupal 10 Headless CMS (Decoupled JSON:API)',
          institucion: inst.nombre_institucion || 'JD STORE S.C.R.L.',
          ruc: inst.ruc || '20600698479'
        }
      },
      data: nodosJsonApi,
      links: {
        self: { href: `${drupalUrl}/jsonapi/node/article` }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── 8. Sincronizar Artículos entre Contenedor Docker Drupal 10 y MySQL ──
exports.sincronizarDrupalCMS = async (req, res, next) => {
  try {
    const [instRows] = await pool.query('SELECT * FROM cms_institucional WHERE id = 1');
    const inst = instRows[0] || {};
    const drupalUrl = req.body?.drupal_url || inst.drupal_url || inst.directus_url || 'http://localhost:8080';

    const resultado = await obtenerArticulosDesdeDrupal(drupalUrl);
    let importados = 0;

    if (resultado.conectado && resultado.articulos.length > 0) {
      for (const art of resultado.articulos) {
        const [existe] = await pool.query(
          'SELECT id_publicacion FROM cms_publicaciones WHERE titulo = ? LIMIT 1',
          [art.titulo]
        );
        if (existe.length === 0) {
          await pool.query(`
            INSERT INTO cms_publicaciones (titulo, categoria, resumen, contenido, imagen_url, autor, destacado, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            art.titulo,
            art.categoria || 'Drupal CMS',
            art.resumen,
            art.contenido,
            art.imagen_url,
            'Drupal 10 CMS',
            art.destacado ? 1 : 0,
            art.estado || 'publicado'
          ]);
          importados++;
        }
      }
    }

    const [totalPubs] = await pool.query('SELECT COUNT(*) AS total FROM cms_publicaciones');

    res.json({
      ok: true,
      drupal_contenedor_activo: resultado.conectado,
      endpoint_jsonapi: resultado.endpoint,
      nodos_remotos_encontrados: resultado.articulos.length,
      nuevos_importados: importados,
      total_publicaciones_activas: totalPubs[0]?.total || 0,
      mensaje: resultado.conectado
        ? `Conectado a Drupal 10 (${resultado.endpoint}). ${importados} artículo(s) nuevo(s) importado(s) a MySQL.`
        : `API JSON:API Headless Drupal activa y sirviendo ${totalPubs[0]?.total || 0} publicaciones desde MySQL (Contenedor Docker Drupal en ${drupalUrl} listo para iniciar).`
    });
  } catch (err) {
    next(err);
  }
};
