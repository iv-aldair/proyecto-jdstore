# 📌 GUÍA OFICIAL: ARQUITECTURA HEADLESS DRUPAL 10 CMS + DOCKER + N8N + AWS EC2 (JD STORE S.C.R.L.)

Este documento detalla cómo está configurado y listo para usar el proyecto **JD Store S.C.R.L.** cumpliendo los **7 puntos de la rúbrica universitaria**, incluyendo **Drupal 10 como Gestor de Contenidos (Headless CMS con JSON:API)**, **Chatbot IA en n8n** y **Despliegue en AWS EC2 (`t2.medium`)**.

---

## 1. Arquitectura Implementada: Headless Drupal 10 (JSON:API)

Para mantener la rapidez y diseño moderno de la tienda en **React + Vite** y a la vez cumplir al 100% con el requisito de utilizar **Drupal como CMS**, el proyecto implementa una arquitectura **Headless / Desacoplada (Decoupled Drupal)**:

1. **Drupal 10 Core (`drupal:10-apache`)** corre en el puerto `8080` con su base de datos dedicada (`jdstore_drupal_db`).
2. Drupal expone sus artículos mediante su módulo nativo **JSON:API v1.0** en:
   * Contenedor Drupal directo: `http://localhost:8080/jsonapi/node/article`
   * Conector / Bridge Integrado del Backend: `http://localhost:3000/api/public/drupal/jsonapi/node/article`
3. El panel administrativo de JD Store (`/admin/cms`) cuenta con:
   * Botón **"Sincronizar con Drupal 10"**: Importa automáticamente cualquier artículo (`node--article`) publicado en Drupal hacia MySQL (`cms_publicaciones`).
   * Botón **"Ver JSON:API (node--article)"**: Abre un visor interactivo con la estructura oficial JSON:API v1.0 para demostrar la integración frente al docente.
   * Botón **"Panel Drupal 10 (:8080)"**: Abre directamente la administración de Drupal.

---

## 2. Cómo Probar Drupal 10 y n8n Localmente con Docker

En la raíz del proyecto ([docker-compose.yml](file:///d:/UNAJ%20ARCHIVOS/X%20SEMESTRE/NEGOCIOS%20ELECTRONICOS/PROYECTOJDSTORE/docker-compose.yml)) y en [backend/docker-compose.yml](file:///d:/UNAJ%20ARCHIVOS/X%20SEMESTRE/NEGOCIOS%20ELECTRONICOS/PROYECTOJDSTORE/backend/docker-compose.yml) ya están configurados los 3 contenedores:
* `jdstore_drupal_cms` (`drupal:10-apache` en puerto `8080`)
* `jdstore_drupal_db` (`mariadb:10.11` preconfigurada para Drupal)
* `jdstore_n8n_chatbot` (`n8nio/n8n:latest` en puerto `5678`)

### Pasos para levantarlo en tu PC:
1. Asegúrate de tener **Docker Desktop** abierto en Windows.
2. En la terminal dentro de la carpeta del proyecto, ejecuta:
   ```powershell
   docker compose up -d
   ```
3. **Configuración inicial de Drupal (solo la primera vez, toma 1 minuto):**
   * Abre `http://localhost:8080`.
   * Elige idioma **Español** ➔ perfil **Estándar**.
   * En **Configuración de Base de Datos**, coloca los datos que ya están creados en el `docker-compose.yml`:
     * **Nombre de la base de datos:** `tienda_jdstore_drupal`
     * **Usuario:** `drupal_user`
     * **Contraseña:** `drupal_password_2026`
     * *(En "Opciones avanzadas" ➔ Host: `drupal-db`)*
   * Una vez dentro de Drupal, ve al menú superior **Ampliar (Extend)** ➔ busca **JSON:API** ➔ actívalo y guarda.
   * Ve a **Contenido ➔ Añadir contenido ➔ Artículo**, crea una noticia y guárdala.
4. En tu sistema JD Store (`http://localhost:5173/admin/cms`), haz clic en **"Sincronizar con Drupal 10"** y la noticia aparecerá automáticamente en tu página web pública (`http://localhost:5173/web#noticias`).

---

## 3. Cómo Desplegar Todo en AWS EC2 (`t2.medium` con tus $50 USD de crédito)

Con una instancia **`t2.medium`** (2 vCPUs, 4 GB de RAM) tienes recursos de sobra para correr todo el ecosistema en paralelo.

### Paso 1: Crear la Instancia EC2 en AWS
1. Entra a tu consola de **AWS ➔ EC2 ➔ Launch Instance (Lanzar instancia)**.
2. **Nombre:** `JDStore-Server-UNAJ`
3. **Imagen (AMI):** `Ubuntu Server 22.04 LTS` o `24.04 LTS` (64-bit x86).
4. **Tipo de instancia:** `t2.medium` (4 GB RAM).
5. **Par de claves (Key pair):** Crea una nueva llave `.pem` (ej. `jdstore-key.pem`) y descárgala.
6. **Configuración de Red (Security Group / Reglas de entrada):** Habilita los siguientes puertos con origen `0.0.0.0/0` (Anywhere):
   * `22` (SSH)
   * `80` y `443` (HTTP / HTTPS)
   * `3000` (API Backend Node.js)
   * `5173` (Portal Web React)
   * `8080` (Drupal 10 Headless CMS)
   * `5678` (n8n Chatbot IA)
7. **Almacenamiento:** `20 GB gp3` y haz clic en **Lanzar Instancia**.

### Paso 2: Subir el Proyecto y Ejecutar el Instalador Automático
Conéctate por SSH a tu instancia EC2 desde tu terminal o desde el botón **"Conectar"** en la consola web de AWS, sube tu carpeta del proyecto (o clónala desde GitHub) y ejecuta el script automático incluido en la raíz ([deploy_aws_ec2.sh](file:///d:/UNAJ%20ARCHIVOS/X%20SEMESTRE/NEGOCIOS%20ELECTRONICOS/PROYECTOJDSTORE/deploy_aws_ec2.sh)):

```bash
chmod +x deploy_aws_ec2.sh
./deploy_aws_ec2.sh
```

El script instalará automáticamente Docker, Node.js 20, MySQL, importará tu base de datos `tienda_jdstore`, levantará Drupal 10 en el puerto `8080`, n8n en el `5678`, el Backend en el `3000` y la Web en el `5173`.
