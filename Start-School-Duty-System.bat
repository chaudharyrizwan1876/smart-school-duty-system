@echo off
title School Duty System - Server
cd /d "%~dp0"

echo Starting School Duty System server...
echo Please wait, this window must stay open while the system is running.
echo.

start "" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 8 /nobreak > nul

start "" http://localhost:3000

echo.
echo Done. The website has opened in your browser.
echo Keep the other black window (server) open in the background.
pause
