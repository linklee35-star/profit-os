@echo off
REM TikTok Shop SEA Profit OS - 本地生产服务器启动器
REM 双击本文件即可在本机启动应用，访问 http://localhost:3000
title TikTok Profit OS (localhost:3000)
cd /d "C:\Users\bl162\WorkBuddy\2026-07-09-18-02-59\tiktok-profit-os"
echo ============================================
echo   TikTok Shop SEA Profit OS
echo   正在启动... 打开浏览器访问:
echo   http://localhost:3000
echo   关闭本窗口即可停止服务
echo ============================================
call npm run start
pause
