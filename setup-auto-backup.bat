@echo off
chcp 65001 > nul
echo ========================================
echo   自动备份任务设置工具
echo   Auto Backup Task Setup Tool
echo ========================================
echo.

REM 获取当前脚本所在目录
set "SCRIPT_DIR=%~dp0"

REM 获取 backup-database.bat 的完整路径
set "BACKUP_SCRIPT=%SCRIPT_DIR%backup-database.bat"

echo 📋 设置信息
echo ----------------------------------------
echo 备份脚本: %BACKUP_SCRIPT%
echo 备份目录: %SCRIPT_DIR%backups
echo 任务计划名称: 东方美谷数据库自动备份
echo 执行频率: 每天凌晨2点
echo 保留天数: 30天
echo ----------------------------------------
echo.
echo 正在创建任务计划...
echo.

REM 创建任务计划（每天凌晨2点执行）
schtasks /create /tn "东方美谷数据库自动备份" /tr "%BACKUP_SCRIPT%" /sc daily /st 02:00 /f 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ 自动备份任务创建成功！
    echo ----------------------------------------
    echo 任务计划已设置：
    echo - 任务名称：东方美谷数据库自动备份
    echo - 执行时间：每天凌晨2:00
    echo - 执行脚本：%BACKUP_SCRIPT%
    echo ----------------------------------------
    echo.
    echo 查看任务：
    echo 1. 打开"任务计划程序"（taskschd.msc）
    echo 2. 找到"东方美谷数据库自动备份"任务
    echo 3. 可以右键修改执行时间
    echo.
    echo 删除任务：
    echo schtasks /delete /tn "东方美谷数据库自动备份" /f
    echo.
) else (
    echo.
    echo ❌ 任务创建失败！
    echo ----------------------------------------
    echo 请以管理员身份运行此脚本！
    echo.
    echo 手动创建任务计划：
    echo 1. 按 Win+R，输入 taskschd.msc
    echo 2. 创建基本任务
    echo 3. 名称：东方美谷数据库自动备份
    echo 4. 触发器：每天，凌晨2:00
    echo 5. 操作：启动程序
    echo 6. 程序：%BACKUP_SCRIPT%
    echo ----------------------------------------
    echo.
)

echo ========================================
echo 设置完成！按任意键退出...
echo ========================================
pause > nul

