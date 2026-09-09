@echo off
title SmartStop AI - Local Web Server
echo ===================================================
echo   SmartStop AI - Localhost Transit Server
echo   Serving at: http://localhost:8080/
echo ===================================================
echo.
echo Opening browser...
start "" "http://localhost:8080/"
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
