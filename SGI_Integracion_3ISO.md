# Integración de las 3 Normas ISO en JD Store
## Sistema de Gestión Integrado (SGI) — Mapa Completo Cláusula por Cláusula

**Proyecto:** JD Store — Sistema POS para tiendas de tecnología  
**Normas integradas:** ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018  
**Herramienta de integración:** Estructura de Alto Nivel — **Anexo SL**  
**Fecha:** 12 de julio de 2026

---

## ¿Por qué se pueden integrar las 3 normas?

> [!IMPORTANT]
> Las tres normas ISO comparten desde 2012 la misma estructura de 10 cláusulas llamada **Anexo SL (HLS - High Level Structure)**. Esto significa que sus requisitos no se contradicen: se **complementan** y pueden gestionarse con un único sistema de documentos, una única política y una única auditoría.

```
┌─────────────────────────────────────────────────────────────────────┐
│              ESTRUCTURA COMÚN — ANEXO SL (Cláusulas 4-10)          │
├──────────────┬────────────────────┬─────────────────────────────────┤
│  ISO 9001    │    ISO 14001       │        ISO 45001                │
│   Calidad    │     Ambiental      │          SST                    │
│              │                    │                                 │
│  "¿El soft  │  "¿La operación   │  "¿El equipo está              │
│   funciona   │   contamina?"      │   seguro?"                     │
│   bien?"     │                    │                                 │
└──────────────┴────────────────────┴─────────────────────────────────┘
                        ↓ comparten ↓
         Política · Objetivos · Auditoría · Revisión por Dirección
                  No Conformidades · Mejora Continua
```

---

## MAPA DE INTEGRACIÓN — Cláusula por Cláusula

### CLÁUSULA 4 — Contexto de la Organización

| Elemento | ISO 9001 (Calidad) | ISO 14001 (Ambiental) | ISO 45001 (SST) | Cómo se materializa en JD Store |
|----------|--------------------|-----------------------|-----------------|--------------------------------|
| **4.1** Contexto externo e interno | Mercado de tecnología en Juliaca, competencia, clientes | Zona geográfica altiplano, uso de energía eléctrica local, regulación ambiental peruana | Condiciones climáticas extremas (heladas), infraestructura eléctrica local | FODA integrado: tiendas en Juliaca, laptop como servidor, internet local, vendedores sin experiencia técnica |
| **4.2** Partes interesadas | Dueño, vendedores, SUNAT, clientes de tienda | Comunidad, MINAM, empresa de residuos, proveedor de energía | Trabajadores, Ministerio de Trabajo, ESSALUD | Tabla única de partes interesadas con columna por cada norma |
| **4.3** Alcance del SGI | Diseño, desarrollo y operación del software POS | Operación de equipos tecnológicos y gestión de residuos electrónicos | Actividades del programador y vendedores en tienda | **Alcance redactado en la Política Integrada (ver Sección siguiente)** |
| **4.4** Sistema de Gestión | Procesos del ciclo de vida del software (SDLC) | Procesos de gestión de recursos y residuos | Procesos de identificación y control de peligros | Mapa de procesos único (estratégicos + operativos + soporte) |

---

### CLÁUSULA 5 — Liderazgo

| Elemento | ISO 9001 | ISO 14001 | ISO 45001 | En JD Store |
|----------|----------|-----------|-----------|-------------|
| **5.1** Liderazgo y compromiso | Enfocado en orientación al cliente y calidad del producto | Énfasis en prevención de contaminación y cumplimiento legal ambiental | **Más exigente**: consulta con trabajadores, participación activa | El Gerente firma la Política Integrada y provee recursos (UPS, sillas ergonómicas, backups) |
| **5.2** Política | Política de calidad | Política ambiental | Política de SST | ✅ **Una sola Política Integrada** (ver sección 2 de este documento) |
| **5.3** Roles y responsabilidades | Enfocado en calidad del proceso y producto | Responsable ambiental designado | **Adicional**: representante de los trabajadores para SST | Tabla de roles: Gerente / Programador / Resp. SGI / Resp. SST / Vendedores |

---

### CLÁUSULA 6 — Planificación

| Elemento | ISO 9001 | ISO 14001 | ISO 45001 | En JD Store |
|----------|----------|-----------|-----------|-------------|
| **6.1** Riesgos y oportunidades | Riesgos del proceso de desarrollo (bugs, caídas, cambios SUNAT) | **Aspectos e Impactos Ambientales** — qué contamina la operación | **IPERC** — qué puede lesionar al personal | ✅ 3 herramientas distintas, mismo ciclo de análisis |
| **6.1.1** General | Determinar riesgos y oportunidades | Igual | Igual | Tabla FODA + matrices específicas por norma |
| **6.1.2** Aspectos ambientales | _(no aplica en 9001)_ | **Matriz de Aspectos e Impactos** (consumo energía, RAEE, papel) | _(no aplica en 45001)_ | ✅ **Ver Sección 3 — Matriz Ambiental** |
| **6.1.2** Identificación de peligros | _(no aplica en 9001)_ | _(no aplica en 14001)_ | **IPERC** con 31 peligros identificados (formato oficial UNAJ) | ✅ **Documento oficial: Matriz IPERC.xlsx** (formato UNAJ) — fuente única para defensa |
| **6.2** Objetivos | KPIs de calidad del software (uptime, bugs/mes) | KPIs ambientales (kWh/mes, kg RAEE) | KPIs de SST (0 accidentes, % pausas activas) | ✅ Tabla de 15 objetivos con meta, indicador y responsable |

---

### CLÁUSULA 7 — Apoyo

| Elemento | Requisito común | Especificidad por norma | En JD Store |
|----------|-----------------|------------------------|-------------|
| **7.1** Recursos | Personas, infraestructura, ambiente de trabajo | 14001 agrega: recursos para gestión ambiental. 45001 agrega: recursos para SST | Hardware, software, red Tailscale, presupuesto para UPS/ergonomía |
| **7.2** Competencia | Personal competente en sus funciones | Competencia en gestión ambiental | Competencia en identificación de peligros | Perfiles de puesto: programador (Node.js, React, SQL, seguridad web), vendedor (uso POS), admin |
| **7.3** Toma de conciencia | Conocer la política y cómo su rol impacta la calidad | Conocer los aspectos ambientales de su trabajo | Conocer los peligros de su puesto y los controles | Charla mensual de 15 min: calidad + ambiente + SST juntos |
| **7.4** Comunicación | Comunicación interna y externa sobre calidad | Comunicación sobre desempeño ambiental | **Más exigente**: consulta y participación de trabajadores en SST | WhatsApp del grupo, changelog del sistema, reunión mensual |
| **7.5** Información documentada | Control de documentos y registros | Ídem | Ídem + registros de participación de trabajadores | Repositorio Git (documentos técnicos) + carpeta Google Drive (registros SGI) |

---

### CLÁUSULA 8 — Operación

> Esta es la cláusula más diferenciada entre normas porque cada una tiene requisitos operacionales propios.

| Sub-cláusula | ISO 9001 (Calidad) | ISO 14001 (Ambiental) | ISO 45001 (SST) |
|---|---|---|---|
| **8.1** Control operacional | Procesos de desarrollo: Git, testing, despliegue controlado | Controles para aspectos significativos: apagado programado, gestión RAEE | Controles del IPERC: UPS, sillas ergonómicas, políticas de contraseña |
| **8.2** Requisitos de productos/servicios | Requisitos del POS: facturación SUNAT, control de inventario, seguridad JWT | _(no aplica directamente)_ | _(no aplica directamente)_ |
| **8.3** Diseño y desarrollo | Control de versiones Git, control de cambios, testing en staging | _(solo considera impactos ambientales del producto al diseñar)_ | _(considera SST en el diseño del entorno de trabajo)_ |
| **8.4** Control de externos | Proveedores: Nubefact (SUNAT), Tailscale, ApisNet Perú | Proveedores de reciclaje de RAEE | EPP si aplica externamente | Evaluación de proveedores críticos |
| **8.6** Liberación de productos | Checklist de despliegue antes de cada release | _(no aplica)_ | _(no aplica)_ | Procedimiento PROC-01 de control de cambios |
| **8.8/8.2** Emergencias | Plan de recuperación del sistema (P1-P4) | Plan de respuesta ambiental (derrame de batería UPS) | Plan de evacuación por sismo/incendio | **Un solo documento** de preparación y respuesta ante emergencias |

---

### CLÁUSULA 9 — Evaluación del Desempeño

| Elemento | Requisito común | Cómo se integra en JD Store |
|----------|-----------------|----------------------------|
| **9.1** Seguimiento y medición | Cada norma define sus propios KPIs | ✅ **Un solo tablero de indicadores** con 3 secciones: Calidad / Ambiental / SST |
| **9.2** Auditoría interna | Las 3 normas requieren auditoría interna | ✅ **Una sola auditoría** con checklist integrado (3 normas en paralelo, un solo auditor) |
| **9.3** Revisión por la dirección | Las 3 normas requieren revisión semestral por alta dirección | ✅ **Una sola reunión semestral** con agenda que cubre los 3 sistemas |

---

### CLÁUSULA 10 — Mejora

| Elemento | Requisito común | Especificidad | En JD Store |
|----------|-----------------|---------------|-------------|
| **10.1** General | Mejora continua del SGI | Ídem en todas | Ciclo PHVA aplicado mensualmente |
| **10.2** No conformidades y acciones correctivas | Las 3 normas requieren NC + causa raíz + acción correctiva | 45001 agrega: investigación de incidentes con participación de trabajadores | **Un solo registro de NC** con campo "tipo": Calidad / Ambiental / SST |
| **10.3** Mejora continua | Ídem en todas | 45001 hace énfasis en la participación de trabajadores | Retrospectivas mensuales del equipo + sugerencias de mejora de vendedores |

---

## SECCIÓN 2 — Política Integrada (Versión Final Formal)

> [!NOTE]
> Este es el documento oficial listo para imprimir, firmar y publicar en todas las tiendas.

---

### 📋 POLÍTICA INTEGRADA DE CALIDAD, MEDIO AMBIENTE Y SEGURIDAD Y SALUD EN EL TRABAJO

**JD STORE** — Sistema de Gestión y Punto de Venta  
Juliaca, Puno, Perú

---

**JD Store**, empresa dedicada al desarrollo, implementación y operación de un sistema de gestión y punto de venta (POS) para tiendas de tecnología en Juliaca, reconoce que la excelencia en la calidad de sus servicios, la protección del medio ambiente y la seguridad de las personas son pilares fundamentales e inseparables de su gestión.

En consecuencia, la organización asume el siguiente compromiso:

**I. EN CALIDAD (ISO 9001:2015):**
> Desarrollar y mantener un sistema de software confiable, seguro y de alto desempeño que cumpla con los requisitos de nuestros usuarios (administradores y vendedores) y las partes interesadas, incluyendo el cumplimiento de la normativa de facturación electrónica de SUNAT. Buscamos la mejora continua de nuestros procesos de desarrollo, pruebas y operación para prevenir errores y garantizar la integridad de los datos financieros e inventarios de nuestros clientes.

**II. EN MEDIO AMBIENTE (ISO 14001:2015):**
> Prevenir la contaminación y reducir progresivamente los impactos ambientales negativos asociados a nuestras operaciones tecnológicas, incluyendo el consumo eficiente de energía eléctrica, la gestión responsable de residuos de aparatos eléctricos y electrónicos (RAEE), y la reducción del consumo de papel mediante la promoción de la facturación y tickets digitales. Cumplimos con los requisitos legales ambientales aplicables en el Perú.

**III. EN SEGURIDAD Y SALUD EN EL TRABAJO (ISO 45001:2018):**
> Proporcionar condiciones de trabajo seguras y saludables para la prevención de lesiones y deterioro de la salud de todos los trabajadores, tanto del equipo de desarrollo como del personal de tienda. Nos comprometemos a eliminar los peligros, reducir los riesgos de SST, consultar y promover la participación activa de los trabajadores, y cumplir con la Ley 29783 y su reglamento DS 005-2012-TR.

---

Esta política es:
- ✅ Apropiada para el propósito y contexto de JD Store
- ✅ Comunicada a todo el personal al ingreso y revisada anualmente
- ✅ Disponible para las partes interesadas que lo soliciten
- ✅ Revisada como mínimo una vez al año para asegurar su vigencia

---

| | |
|---|---|
| **Firma:** _________________________ | **Cargo:** Gerente General |
| **Fecha de aprobación:** ____/____/2026 | **Próxima revisión:** ____/____/2027 |

---

## SECCIÓN 3 — Matriz de Aspectos e Impactos Ambientales (ISO 14001)

> La evaluación de significancia usa: **Magnitud (1-3) × Frecuencia (1-3) × Alcance (1-3)** = Puntaje (máx. 27)  
> **≥ 13 puntos = Aspecto Significativo** (requiere objetivo ambiental y control operacional)
>
> **Criterio de Alcance:** 1 = local (dentro del local), 2 = provincial (Juliaca/Puno), 3 = nacional/global (p.ej. emisiones de CO₂ que contribuyen al cambio climático, o contaminantes que atraviesan cuencas).

| N° | Actividad | Aspecto Ambiental | Impacto Ambiental | Condición | Magnitud | Frecuencia | Alcance | Puntaje | ¿Significativo? | Control Operacional |
|----|-----------|-------------------|-------------------|-----------|----------|------------|---------|---------|-----------------|---------------------|
| 1 | Servidor encendido 13h/día (8am-9pm) | Consumo de energía eléctrica | Agotamiento de recursos no renovables; emisiones de CO₂ asociadas a la generación eléctrica — impacto global sobre el cambio climático | Normal | 2 | 3 | **3** ¹ | **18** | ✅ **Sí** | Apagado programado fuera de horario (script automático); modo ahorro de energía activo; evaluar migración a nube con energía renovable |
| 2 | 3 PCs de tienda encendidas 12h/día | Consumo de energía eléctrica | Agotamiento de recursos no renovables; contribución a emisiones de CO₂ de alcance global | Normal | 2 | 3 | **3** ¹ | **18** | ✅ **Sí** | Modo suspensión automático tras 10 min de inactividad; apagado obligatorio al cerrar cada tienda; etiqueta recordatoria en cada PC |
| 3 | Baja de equipos (laptops/PCs/impresoras obsoletas) | Generación de RAEE | Contaminación del suelo y aguas subterráneas por metales pesados (plomo, mercurio, cadmio) — impacto provincial | Anormal | 3 | 1 | 2 | **6** | ✅ No | Acta de entrega a operador de RAEE autorizado (DS 009-2019-MINAM); registro fotográfico del equipo desechado |
| 4 | Reemplazo de baterías UPS | Generación de residuos peligrosos (batería de plomo-ácido) | Contaminación del suelo y agua por ácido sulfúrico y plomo | Anormal | 3 | 1 | 2 | **6** | ✅ No | Entrega a proveedor o punto de recolección autorizado de baterías |
| 5 | Impresión de tickets de venta (impresora térmica) | Consumo de papel térmico con Bisfenol A (BPA) | Deforestación; contaminación por BPA (disruptor endocrino reconocido) en residuos sólidos urbanos | Normal | **3** ² | 3 | 2 | **18** | ✅ **Sí** | Implementar envío digital de tickets (WhatsApp/email); comprar papel térmico certificado libre de BPA; meta: reducir 20% de rollos/mes en 6 meses |
| 6 | Facturación electrónica SUNAT | **Reducción** de papel (aspecto positivo) | Conservación de recursos naturales, reducción de residuos de papel | Normal | 2 | 3 | 3 | **18** | ✅ **Positivo Significativo** | ✅ JD Store ya emite boletas y facturas 100% electrónicas — documentar como logro ambiental ante partes interesadas |
| 7 | Disposición final de UPS al término de vida útil | Residuos sólidos (plástico, metal, circuitos) | Contaminación de suelo local | Anormal | 2 | 1 | 2 | **4** | ✅ No | Separación en la fuente; entrega diferenciada a reciclador autorizado |
| 8 | Limpieza de equipos con isopropanol o aire comprimido | Emisión de compuestos orgánicos volátiles (COV) | Contaminación del aire interior; riesgo a la salud del operador | Esporádico | 1 | 2 | 1 | **2** | ✅ No | Realizar en áreas ventiladas; usar la cantidad mínima necesaria |
| 9 | Desplazamiento entre tiendas para mantenimiento | Consumo de combustible (mototaxi/combi) | Emisiones de CO₂ y material particulado, contaminación del aire local | Normal | 1 | 2 | 1 | **2** | ✅ No | Priorizar soporte remoto vía Tailscale; agrupar visitas presenciales para reducir traslados |
| 10 | Impresión de documentos del SGI | Consumo de papel y tóner | Deforestación; residuos de tóner (contiene carbono negro) | Normal | 1 | 2 | 1 | **2** | ✅ No | Gestión documental 100% digital (Google Drive + repositorio Git); imprimir solo documentos que requieren firma física |

> ¹ **Justificación Alcance = 3 (global)** para ítems 1 y 2: La energía eléctrica en Perú se genera mayoritariamente con centrales térmicas y el factor de emisión del SEIN (Sistema Eléctrico Interconectado Nacional) es ~0.6 tCO₂/MWh. Las emisiones de CO₂ son contaminantes de alcance global reconocidos por el IPCC — independientemente de dónde se consuma la electricidad, el impacto climático es transfronterizo.  
> ² **Justificación Magnitud = 3 (alta)** para ítem 5: El Bisfenol A (BPA) presente en el papel térmico está clasificado como disruptor endocrino por la EFSA y la OMS. Su exposición crónica está asociada a alteraciones hormonales, metabólicas y reproductivas. Aunque el volumen es moderado, la toxicidad intrínseca del compuesto justifica calificar el impacto como alto.

### Resumen de Aspectos Significativos (Puntaje ≥ 13)

| N° | Aspecto Significativo | Puntaje | Objetivo Ambiental Vinculado |
|----|-----------------------|---------|------------------------------|
| 1 | Consumo energético del servidor (A1) | **18** | Reducir kWh/mes en 15% al cabo de 12 meses vs. línea base |
| 2 | Consumo energético de PCs en tienda (A2) | **18** | Activar modo suspensión y apagado programado en los 4 equipos |
| 3 | Consumo de papel térmico con BPA (A5) | **18** | Reducir rollos/mes en 20% en 6 meses; migrar a ticket digital |
| 4 | Facturación electrónica — aspecto positivo (A6) | **18** | Mantener 100% de documentos tributarios emitidos electrónicamente |

---

## SECCIÓN 4 — Cómo el Software JD Store Apoya (pero no ES) el SGI

> [!IMPORTANT]
> Comprender esta distinción es clave para defender tu trabajo académico. El software **apoya** el cumplimiento de los requisitos ISO, pero el sistema de gestión son las **políticas, procedimientos y registros** alrededor de él.

```
┌─────────────────────────────────────────────────────────────────────┐
│              EL SOFTWARE JD STORE Y EL SGI                         │
├─────────────────────────────────┬───────────────────────────────────┤
│  Funcionalidad del Software     │  Requisito ISO que apoya         │
├─────────────────────────────────┼───────────────────────────────────┤
│ Log de actividad por usuario    │ ISO 9001: 8.5 Trazabilidad       │
│ (quién hizo qué y cuándo)       │ ISO 45001: 9.1 Seguimiento       │
├─────────────────────────────────┼───────────────────────────────────┤
│ Backup automático de la BD      │ ISO 9001: 8.1 Control operac.    │
│ (cron job nocturno)             │ ISO 9001: 8.5.3 Prop. del cliente│
├─────────────────────────────────┼───────────────────────────────────┤
│ Alertas de stock mínimo         │ ISO 9001: 8.4 Control de externos│
│ (evitar rotura de stock)        │ ISO 9001: 8.6 Liberación product.│
├─────────────────────────────────┼───────────────────────────────────┤
│ Facturación SUNAT vía Nubefact  │ ISO 9001: 8.2.3 Requisitos legales│
│ (100% electrónica)              │ ISO 14001: 6.2 Objetivos ambient. │
├─────────────────────────────────┼───────────────────────────────────┤
│ Helmet.js + Rate Limiting       │ ISO 9001: 8.5.2 Identificación   │
│ (seguridad de la API)           │ ISO 45001: 8.1 Control de riesgos│
├─────────────────────────────────┼───────────────────────────────────┤
│ Dashboard de KPIs               │ ISO 9001: 9.1 Seguimiento        │
│ (ingresos, utilidad, stock)     │ ISO 14001: 9.1 Evaluación        │
├─────────────────────────────────┼───────────────────────────────────┤
│ Control de roles JWT            │ ISO 9001: 7.5 Info. documentada  │
│ (Admin/Vendedor)                │ ISO 45001: 6.1 Gestión de riesgos│
├─────────────────────────────────┼───────────────────────────────────┤
│ Historial de ventas/comprobantes│ ISO 9001: 7.5.3 Control de regist│
│ (trazabilidad de transacciones) │ ISO 9001: 9.1.2 Satisfac. cliente│
├─────────────────────────────────┼───────────────────────────────────┤
│ Ticket digital (WhatsApp/email) │ ISO 14001: 6.2 Obj. ambiental    │
│ (reducción de papel térmico)    │ (Aspecto significativo N°2)      │
└─────────────────────────────────┴───────────────────────────────────┘

LO QUE EL SOFTWARE NO HACE (y debe estar en documentos del SGI):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Política Integrada           → Documento firmado por gerencia
• IPERC                        → Matriz IPERC.xlsx (formato UNAJ, 31 peligros) ← FUENTE OFICIAL
• Procedimientos operativos    → Instructivos escritos (PROC-01 al 08)
• Programa de capacitación     → Calendario de charlas y registros
• Auditoría interna            → Checklist y acta de auditor
• Revisión por la Dirección    → Acta semestral de reunión
• Exámenes médicos ocupacionales → Registros clínicos del personal
• Gestión de RAEE              → Actas de entrega a reciclador
```

---

## SECCIÓN 5 — Matriz de Requisitos Legales Aplicables (Perú)

| Norma | Descripción | Artículos Clave | Norma ISO que lo exige | ¿Cumple JD Store? |
|-------|-------------|-----------------|------------------------|-------------------|
| **Ley 29783** | Ley de Seguridad y Salud en el Trabajo | Art. 19 (IPERC), Art. 36 (examen médico), Art. 74 (participación trabajadores) | ISO 45001: 6.1, 9.1 | ⚠️ Parcial (falta examen médico) |
| **DS 005-2012-TR** | Reglamento Ley 29783 | Art. 77-86 (IPERC), Art. 98 (capacitación), Art. 33 (registros) | ISO 45001: 6.1.2, 7.2 | ⚠️ Parcial (falta algunos registros) |
| **RM 050-2013-TR** | Formatos referenciales SGSST | Registro de accidentes, NC, exámenes | ISO 45001: 7.5 | ✅ Metodología IPERC adoptada |
| **Ley 29733** | Protección de Datos Personales | Art. 13 (consentimiento), Art. 16 (seguridad) | ISO 9001: 8.5.3 | ⚠️ Parcial (falta política privacidad visible) |
| **DS 340-2017/SUNAT** | Sistema de Emisión Electrónica | Formatos XML, validación Nubefact | ISO 9001: 8.2.3 | ✅ Implementado vía Nubefact |
| **Ley 28611** | Ley General del Ambiente | Art. 74 (minimización residuos) | ISO 14001: 6.1.2 | ⚠️ Sin programa formal documentado |
| **DS 009-2019-MINAM** | Gestión de RAEE | Art. 7 (obligaciones generadores RAEE) | ISO 14001: 8.1 | ❌ No documentado aún |
| **DL 1278** | Ley de Gestión Integral de Residuos Sólidos | Art. 32 (segregación en la fuente) | ISO 14001: 8.1 | ❌ Sin implementar |

---

## SECCIÓN 6 — Tablero de Indicadores Integrado (Para Revisión por la Dirección)

| # | Indicador | Norma | Fórmula | Frecuencia | Meta | Estado actual |
|---|-----------|-------|---------|------------|------|---------------|
| **CALIDAD** | | | | | | |
| C1 | Uptime del sistema | 9001 | (Horas operativas/Horas totales)×100 | Mensual | ≥99.5% | Por medir |
| C2 | Bugs críticos (P1+P2) | 9001 | Conteo/mes | Mensual | ≤2 bugs | Por medir |
| C3 | Éxito facturación SUNAT | 9001 | (OK/Total emitidas)×100 | Mensual | ≥99% | Por medir |
| C4 | Descuadre promedio de caja | 9001 | (Descuadre/Ventas)×100 | Diario | ≤0.5% | Por medir |
| C5 | Satisfacción del usuario | 9001 | Encuesta 1-5 | Trimestral | ≥4.0 | Por medir |
| **AMBIENTAL** | | | | | | |
| A1 | Consumo energético | 14001 | kWh/mes (servidor+PCs) | Mensual | -15%/año vs línea base | Por medir |
| A2 | Tickets digitales | 14001 | (Tickets digitales/Total)×100 | Mensual | ≥30% en 6 meses | 0% (por implementar) |
| A3 | Papel térmico | 14001 | Rollos/mes | Mensual | -20% en 6 meses | Por medir |
| A4 | RAEE gestionado | 14001 | kg entregados/kg generados×100 | Al evento | 100% | Por implementar |
| **SST** | | | | | | |
| S1 | Accidentes laborales | 45001 | Conteo/semestre | Semestral | 0 | Por registrar |
| S2 | Índice de frecuencia | 45001 | (Accidentes×200,000)/HH trabajadas | Semestral | 0 | Por calcular |
| S3 | Controles IPERC ejecutados | 45001 | (Ejecutados/Total)×100 | Trimestral | 100% | ~30% ejecutado |
| S4 | Pausas activas | 45001 | (Realizadas/Programadas)×100 | Mensual | ≥80% | Sin programa |
| S5 | Capacitación SST | 45001 | h/trabajador/año | Anual | ≥8h | 0h |

---

## SECCIÓN 7 — Resumen Ejecutivo para Defensa Académica

> [!TIP]
> Si tienes que defender este trabajo ante tu profesor, estos son los argumentos clave:

### ¿Por qué integrar las 3 ISO en un solo SGI?

1. **Estructura común (Anexo SL):** Las 3 normas comparten las mismas cláusulas 4-10, lo que permite una sola política, una sola auditoría y un solo ciclo de mejora continua, reduciendo la burocracia.

2. **Sinergia real en JD Store:**
   - El log de auditoría del software apoya simultáneamente a ISO 9001 (trazabilidad), ISO 45001 (seguridad de acceso) y ISO 14001 (monitoreo indirecto del uso de recursos)
   - La facturación electrónica cumple requisitos de SUNAT (9001) Y reduce papel (14001)
   - El backup automático protege datos del cliente (9001) Y evita horas extras de recuperación que aumentan riesgo ergonómico (45001)

3. **Coherencia de Anexo SL:** Se demuestra dominio de la Estructura de Alto Nivel, que es exactamente lo que los auditores de ISO buscan en una integración.

4. **Proporcionalidad académicamente válida:** No toda empresa necesita certificarse. Lo que se demuestra es que **se conoce el sistema** y se puede aplicar incluso a proyectos de software pequeños, adaptando el alcance (Ley 29783 aplica desde 1 trabajador; ISO 14001 aplica a cualquier organización con aspectos ambientales).

---

*Documentos relacionados:*  
- `IPERC_JDStore.md` — Matriz completa de 26 riesgos de SST  
- `ISO_SGI_JDStore.md` — Documento base del SGI (cláusulas 4-10 detalladas)  
- `Manual_Usuario.md` — Instructivo operativo del POS (Nivel 3 documental)
