@echo off
title Actualizar Base de Datos JDStore
color 0B

echo ==============================================================
echo           ACTUALIZANDO BASE DE DATOS (JD STORE)
echo ==============================================================
echo.
echo Creando las nuevas tablas (Ej: Guias de Remision)...
echo Asegurate de que XAMPP (MySQL) este encendido.
echo.

cd backend
node run_sql.js

echo.
echo Proceso finalizado. Puedes cerrar esta ventana.
pause
