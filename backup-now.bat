@echo off
chcp 65001 > nul
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║           数据库立即备份工具                 ║
echo ║        Database Backup Tool (Now)           ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ========================================
REM 配置区域 - 请根据实际情况修改
REM ========================================

REM MySQL 路径配置
set MYSQL_PATH=C:\xampp\mysql\bin

REM 数据库配置
set DB_HOST=localhost
set DB_USER=root
set DB_PASS=
set DB_NAME=fangmeigu

REM 备份目录（相对于脚本所在目录）
set BACKUP_DIR=%~dp0backups

REM 保留天数
set KEEP_DAYS=30

REM ========================================
REM 备份主逻辑
REM ========================================

REM 检查 MySQL 路径是否存在
if not exist "%MYSQL_PATH%\mysqldump.exe" (
    echo ❌ 错误：找不到 mysqldump.exe
    echo 请检查 MySQL 路径是否正确：%MYSQL_PATH%
    echo.
    echo 如果您的 XAMPP 安装在不同的位置，请编辑此脚本的第一行配置
    echo.
    pause
    exit /b 1
)

REM 创建备份目录
if not exist "%BACKUP_DIR%" (
    echo 📁 创建备份目录: %BACKUP_DIR%
    mkdir "%BACKUP_DIR%"
    if errorlevel 1 (
        echo ❌ 无法创建备份目录
        pause
        exit /b 1
    )
)

REM 获取当前日期时间
set "year=%date:~0,4%"
set "month=%date:~5,2%"
set "day=%date:~8,2%"
set "hour=%time:~0,2%"
set "minute=%time:~3,2%"
set "second=%time:~6,2%"

REM 去除小时前导空格
if "%hour:~0,1%"==" " set "hour=0%hour:~1,1%"

REM 组合日期时间
set "datetime=%year%%month%%day%_%hour%%minute%%second%"

REM 设置备份文件名
set "BACKUP_FILE=%BACKUP_DIR%\fangmeigu_%datetime%.sql"

echo.
echo 📋 备份信息
echo ───────────────────────────────────────
echo 数据库: %DB_NAME%
echo 备份时间: %year%-%month%-%day% %hour%:%minute%:%second%
echo 保存位置: %BACKUP_FILE%
echo ───────────────────────────────────────
echo.

REM 执行备份
echo.
echo 🔄 正在备份数据库...
echo.
echo 提示：如果数据库很大，可能需要几分钟时间...
echo.

"%MYSQL_PATH%\mysqldump.exe" -h %DB_HOST% -u %DB_USER% --password=%DB_PASS% --default-character-set=utf8mb4 --single-transaction --routines --triggers %DB_NAME% > "%BACKUP_FILE%" 2>nul

REM 检查备份是否成功
if %errorlevel% equ 0 (
    REM 获取文件大小
    for %%A in ("%BACKUP_FILE%") do set size=%%~zA
    
    REM 格式化文件大小显示
    if %size% LSS 1048576 (
        set /a "sizeKB=%size%/1024"
        set "sizeDisplay=%sizeKB% KB"
    ) else (
        set /a "sizeMB=%size%/1024/1024"
        set "sizeDisplay=%sizeMB% MB"
    )
    
    echo.
    echo ✅ 备份成功！
    echo ───────────────────────────────────────
    echo 文件大小: %sizeDisplay%
    echo 文件路径: %BACKUP_FILE%
    echo ───────────────────────────────────────
    echo.
    
    REM 记录备份日志
    echo [%year%-%month%-%day% %hour%:%minute%:%second%] 备份成功: %BACKUP_FILE% ^(%sizeDisplay%^) >> "%BACKUP_DIR%\backup.log"
    
    REM 清理旧备份
    echo 🗑️  清理%KEEP_DAYS%天前的旧备份...
    forfiles /p "%BACKUP_DIR%" /m fangmeigu_*.sql /d -%KEEP_DAYS% /c "cmd /c del @path" 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 已清理旧备份
    ) else (
        echo ℹ️  没有需要清理的旧备份
    )
    
    echo.
    echo ╔══════════════════════════════════════════════╗
    echo ║            ✅ 备份完成！                     ║
    echo ╚══════════════════════════════════════════════╝
    
) else (
    echo.
    echo ❌ 备份失败！
    echo ───────────────────────────────────────
    echo 错误代码: %errorlevel%
    echo.
    echo 可能的原因：
    echo   1. MySQL 服务未启动
    echo      → 请打开 XAMPP 控制面板启动 MySQL
    echo   2. 数据库不存在或名称错误
    echo      → 请检查数据库名称是否正确
    echo   3. 用户名或密码错误
    echo      → 请检查数据库连接配置
    echo   4. 没有权限访问数据库
    echo      → 请确认用户有足够权限
    echo ───────────────────────────────────────
    echo.
    
    REM 记录失败日志
    echo [%year%-%month%-%day% %hour%:%minute%:%second%] 备份失败，错误代码: %errorlevel% >> "%BACKUP_DIR%\backup.log"
)

echo.
echo 按任意键退出...
pause >nul
exit /b %errorlevel%

