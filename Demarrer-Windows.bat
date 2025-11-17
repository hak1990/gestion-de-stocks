@echo off
REM ============================================
REM Script de démarrage - Gestion de Stocks
REM Compatible Windows 7/8/10/11
REM ============================================

setlocal enabledelayedexpansion
color 0A
title Gestion de Stocks - Demarrage

echo.
echo ================================================
echo    APPLICATION DE GESTION DE STOCKS
echo    Demarrage en cours...
echo ================================================
echo.

REM Se placer dans le repertoire du script
cd /d "%~dp0"
if errorlevel 1 (
    echo ERREUR: Impossible d'acceder au repertoire du script
    pause
    exit /b 1
)

echo [1/6] Verification de Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERREUR: Node.js n'est pas installe ou pas dans le PATH!
    echo.
    echo Veuillez installer Node.js depuis: https://nodejs.org
    echo Recommandation: Version LTS (Long Term Support)
    echo.
    echo Apres installation, redemarrez votre ordinateur.
    echo.
    pause
    exit /b 1
)

REM Afficher la version de Node.js
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo    - Node.js detecte: %NODE_VERSION%

echo.
echo [2/6] Verification de npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERREUR: npm n'est pas disponible!
    echo npm devrait etre installe avec Node.js.
    echo.
    echo Reinstallez Node.js depuis: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo    - npm detecte: v%NPM_VERSION%

echo.
echo [3/6] Verification des dependances...
if not exist "node_modules\" (
    echo    - node_modules non trouve
    echo    - Installation des dependances (premiere fois)...
    echo    - Ceci peut prendre 5-10 minutes selon votre connexion
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo ERREUR: L'installation des dependances a echoue!
        echo.
        echo Solutions possibles:
        echo - Verifiez votre connexion Internet
        echo - Executez ce script en tant qu'administrateur
        echo - Supprimez le dossier node_modules et reessayez
        echo.
        pause
        exit /b 1
    )
    echo    - Installation reussie!
) else (
    echo    - Dependances deja installees
)

echo.
echo [4/6] Configuration de Prisma...
if not exist "node_modules\.prisma\" (
    echo    - Generation du client Prisma...
    npx prisma generate
    if errorlevel 1 (
        echo    - ATTENTION: Erreur lors de la generation Prisma
        echo    - L'application pourrait ne pas fonctionner correctement
    ) else (
        echo    - Client Prisma genere
    )
) else (
    echo    - Client Prisma deja configure
)

echo.
echo [5/6] Initialisation de la base de donnees...
npx prisma db push
if errorlevel 1 (
    echo    - ATTENTION: Erreur lors de l'initialisation de la base
    echo    - L'application pourrait ne pas fonctionner correctement
) else (
    echo    - Base de donnees prete
)

echo.
echo [6/6] Demarrage de l'application...
echo.
echo ================================================
echo   L'application va s'ouvrir dans votre
echo   navigateur a l'adresse:
echo.
echo   http://localhost:3000
echo.
echo   NE FERMEZ PAS CETTE FENETRE tant que vous
echo   utilisez l'application
echo.
echo   Pour arreter: Appuyez sur CTRL+C
echo ================================================
echo.

REM Attendre 5 secondes avant d'ouvrir le navigateur
echo Ouverture du navigateur dans 5 secondes...
timeout /t 5 /nobreak >nul

REM Ouvrir le navigateur par defaut
start http://localhost:3000

REM Demarrer le serveur Next.js
echo.
echo Serveur en cours de demarrage...
echo.
npm run dev

REM Si le serveur s'arrete, garder la fenetre ouverte
echo.
echo.
echo Le serveur s'est arrete.
echo.
pause
