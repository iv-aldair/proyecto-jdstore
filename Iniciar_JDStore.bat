@echo off
title Servidor JDStore
color 0A

echo ==============================================================
echo                   SISTEMA JD STORE - SERVIDOR
echo ==============================================================
echo.
echo No cierres esta ventana negra mientras la tienda este operando.
echo.
echo Iniciando el servidor principal...
echo.

cd backend
node src/app.js

echo.
echo El servidor se ha detenido de forma inesperada.
pause
