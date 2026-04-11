@echo off
echo ========================================
echo Clearing Browser Cache & Opening Game
echo ========================================
echo.
echo Membersihkan cache browser...
echo.

REM Clear Edge cache
taskkill /F /IM msedge.exe 2>nul
timeout /t 2 /nobreak >nul

REM Clear Chrome cache  
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cache cleared!
echo.
echo Opening game with fresh cache...
echo.

REM Open Edge with cache clearing flags
start "" msedge.exe --disable-cache --disable-application-cache "%~dp0index.html"

echo.
echo ========================================
echo Game should be opening now!
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Press Ctrl+Shift+R (Hard Refresh)
echo 2. Press F12 to open Console
echo 3. Click "Play" then "Start Game"
echo 4. Check Console for any errors
echo.
pause
