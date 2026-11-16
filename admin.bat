@echo off
chcp 65001 >nul 2>&1
title A Casa do Serafim - Admin

echo.
echo  ============================================
echo    A Casa do Serafim - Painel Admin
echo  ============================================
echo.

where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERRO: Bun nao esta instalado.
    echo  Execute o "instalar.bat" primeiro.
    echo.
    pause
    exit /b 1
)

echo  Iniciando painel administrativo...
echo  O navegador vai abrir automaticamente.
echo.
echo  Para parar: feche esta janela ou pressione Ctrl+C
echo.

timeout /t 2 /nobreak >nul
start http://localhost:3001/admin/

bun admin/src/server.ts
