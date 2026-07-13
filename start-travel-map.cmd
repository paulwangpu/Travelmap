@echo off
setlocal
cd /d "%~dp0"

set "BUNDLED_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if exist "%BUNDLED_NODE%" (
  "%BUNDLED_NODE%" travel-map-server.js
  exit /b
)

where node >nul 2>nul
if %errorlevel%==0 (
  node travel-map-server.js
  exit /b
)

echo Node.js was not found.
echo Please install Node.js, or ask Codex to start the local server for you.
pause
