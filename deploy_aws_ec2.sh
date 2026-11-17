#!/bin/bash
# ==============================================================================
# 🚀 SCRIPT DE DESPLIEGUE AUTOMÁTICO EN AWS EC2 (t2.medium - Ubuntu 22.04/24.04)
# Proyecto: JD STORE S.C.R.L. (Web Institucional + MySQL + Drupal 10 CMS + n8n)
# ==============================================================================

set -e

echo "=================================================================="
echo " 1. Actualizando paquetes e instalando Docker, Node.js 20 y MySQL "
echo "=================================================================="
sudo apt-get update -y
sudo apt-get install -y curl git ca-certificates gnupg mysql-server nginx

# Instalar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker $USER
fi

# Instalar Node.js 20 LTS y PM2
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo npm install -g pm2
fi

echo "=================================================================="
echo " 2. Configurando Base de Datos MySQL (tienda_jdstore)             "
echo "=================================================================="
sudo systemctl enable mysql
sudo systemctl start mysql

sudo mysql -e "CREATE DATABASE IF NOT EXISTS tienda_jdstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; FLUSH PRIVILEGES;"

if [ -f "backend/database/schema.sql" ]; then
  mysql -u root -proot tienda_jdstore < backend/database/schema.sql || true
fi
if [ -f "backend/database/seed.sql" ]; then
  mysql -u root -proot tienda_jdstore < backend/database/seed.sql || true
fi

echo "=================================================================="
echo " 3. Levantando Contenedores Docker: Drupal 10 CMS (:8080) + n8n (:5678)"
echo "=================================================================="
sudo docker compose up -d

echo "=================================================================="
echo " 4. Compilando e Iniciando Backend (Puerto 3000) y Frontend React "
echo "=================================================================="
cd backend
npm install
pm2 delete jdstore-backend || true
pm2 start src/app.js --name "jdstore-backend"
cd ..

cd frontend
npm install
npm run build
pm2 delete jdstore-frontend || true
pm2 serve dist 5173 --name "jdstore-frontend" --spa
cd ..

pm2 save

IP_PUBLICA=$(curl -s http://checkip.amazonaws.com || echo "TU_IP_AWS")
echo "=================================================================="
echo "✅ ¡DESPLIEGUE EN AWS EC2 COMPLETADO CON ÉXITO!"
echo "🌐 Página Web Institucional : http://${IP_PUBLICA}:5173/web"
echo "🧩 Drupal 10 Headless CMS   : http://${IP_PUBLICA}:8080"
echo "📡 Drupal JSON:API Endpoint : http://${IP_PUBLICA}:3000/api/public/drupal/jsonapi/node/article"
echo "🤖 Chatbot IA n8n           : http://${IP_PUBLICA}:5678"
echo "=================================================================="
