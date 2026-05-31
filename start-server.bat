@echo off
setlocal
cd /d "%~dp0"

echo Starting local server at http://localhost:5500/index.html
echo Press Ctrl+C to stop the server.
echo.

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 -m http.server 5500
    goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server 5500
    goto :eof
)

echo Python was not found. Please install Python 3 first.
pause
