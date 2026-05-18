@echo off
echo ========================================
echo Starting Game Server (No Cache!)
echo ========================================
echo.
echo Browser akan otomatis terbuka di:
echo http://localhost:8000
echo.
echo Tekan Ctrl+C untuk stop server
echo.

cd /d "%~dp0"

REM Kill any existing python servers first
taskkill /F /IM python.exe >nul 2>&1

REM Start Python HTTP server
start "" http://localhost:8000/index.html
python -m http.server 8000

pause
