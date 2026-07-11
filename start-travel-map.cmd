@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4173/index.html
  py -m http.server 4173 --bind 127.0.0.1
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4173/index.html
  python -m http.server 4173 --bind 127.0.0.1
  exit /b
)
echo Python was not found. Please install Python or run another local HTTP server in this folder.
pause
