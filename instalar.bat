@echo off
chcp 65001 >nul 2>&1
title A Casa do Serafim - Instalacao

echo.
echo  ============================================
echo    A Casa do Serafim - Instalacao
echo  ============================================
echo.
echo  Este script instala tudo que voce precisa.
echo  Execute apenas uma vez.
echo.
pause

echo.
echo  [1/3] Verificando se Bun esta instalado...
where bun >nul 2>&1
if %errorlevel%==0 (
    echo         Bun ja esta instalado!
) else (
    echo         Instalando Bun...
    powershell -Command "irm bun.sh/install.ps1 | iex"
    if %errorlevel% neq 0 (
        echo.
        echo  ERRO: Nao foi possivel instalar o Bun.
        echo  Tente instalar manualmente: https://bun.sh
        pause
        exit /b 1
    )
    echo         Bun instalado com sucesso!
)

echo.
echo  [2/3] Instalando dependencias do site...
call bun install
if %errorlevel% neq 0 (
    echo  ERRO ao instalar dependencias do site.
    pause
    exit /b 1
)

echo.
echo  [3/3] Instalando dependencias do admin...
cd admin
call bun install
cd ..
if %errorlevel% neq 0 (
    echo  ERRO ao instalar dependencias do admin.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo    Instalacao concluida com sucesso!
echo  ============================================
echo.
echo  Agora voce pode usar:
echo    - admin.bat     (abrir painel administrativo)
echo.
pause
