<?php
/**
 * 数据库自动备份脚本
 * 使用说明：php backup-database.php
 * 或通过浏览器访问：http://localhost/新龙/backup-database.php
 */

// 引入配置
require_once 'api/config.php';

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 备份配置
$BACKUP_DIR = __DIR__ . '/backups';
$DATABASE_NAME = DB_NAME;
$DATABASE_HOST = DB_HOST;
$DATABASE_USER = DB_USER;
$DATABASE_PASS = DB_PASS;

// 保留天数（超过此天数的备份将被自动删除）
$KEEP_DAYS = 30;

// 获取当前日期时间
$datetime = date('Ymd_His');

// 备份文件名
$backup_file = $BACKUP_DIR . '/fangmeigu_' . $datetime . '.sql';

// 创建备份目录
if (!file_exists($BACKUP_DIR)) {
    mkdir($BACKUP_DIR, 0755, true);
}

// 函数：执行备份
function backupDatabase($host, $user, $pass, $database, $backup_file) {
    $command = sprintf(
        'mysqldump --host=%s --user=%s --password=%s %s > %s 2>&1',
        escapeshellarg($host),
        escapeshellarg($user),
        escapeshellarg($pass),
        escapeshellarg($database),
        escapeshellarg($backup_file)
    );
    
    exec($command, $output, $return_var);
    return $return_var === 0;
}

// 函数：清理旧备份
function cleanOldBackups($backup_dir, $keep_days) {
    $files = glob($backup_dir . '/fangmeigu_*.sql');
    $deleted_count = 0;
    $cutoff_time = time() - ($keep_days * 24 * 60 * 60);
    
    foreach ($files as $file) {
        if (filemtime($file) < $cutoff_time) {
            unlink($file);
            $deleted_count++;
        }
    }
    
    return $deleted_count;
}

// 函数：记录日志
function writeLog($message, $log_file) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

// 主逻辑
$is_cli = php_sapi_name() === 'cli';
$log_file = $BACKUP_DIR . '/backup.log';

if ($is_cli) {
    // 命令行模式
    echo "========================================\n";
    echo "   数据库自动备份工具\n";
    echo "   Database Auto Backup Tool\n";
    echo "========================================\n\n";
    
    echo "备份信息\n";
    echo "----------------------------------------\n";
    echo "数据库名称: $DATABASE_NAME\n";
    echo "备份时间: " . date('Y-m-d H:i:s') . "\n";
    echo "备份文件: $backup_file\n";
    echo "----------------------------------------\n\n";
    
    echo "🔄 正在备份数据库，请稍候...\n";
    
    if (backupDatabase($DATABASE_HOST, $DATABASE_USER, $DATABASE_PASS, $DATABASE_NAME, $backup_file)) {
        $file_size = filesize($backup_file);
        $file_size_mb = round($file_size / 1024 / 1024, 2);
        
        echo "\n✅ 备份成功！\n";
        echo "----------------------------------------\n";
        echo "文件大小: $file_size_mb MB\n";
        echo "保存位置: $backup_file\n";
        echo "----------------------------------------\n\n";
        
        writeLog("备份成功: $backup_file ($file_size_mb MB)", $log_file);
        
        // 清理旧备份
        echo "🗑️  正在清理{$KEEP_DAYS}天前的旧备份...\n";
        $deleted = cleanOldBackups($BACKUP_DIR, $KEEP_DAYS);
        if ($deleted > 0) {
            echo "✅ 已清理 $deleted 个旧备份文件\n";
            writeLog("清理旧备份: 删除 $deleted 个文件", $log_file);
        } else {
            echo "ℹ️  没有需要清理的旧备份\n";
        }
        
        echo "\n========================================\n";
        echo "备份完成！\n";
        echo "========================================\n";
    } else {
        echo "\n❌ 备份失败！\n";
        echo "----------------------------------------\n";
        echo "可能的原因：\n";
        echo "1. MySQL 未启动\n";
        echo "2. 数据库连接信息错误\n";
        echo "3. mysqldump 命令不可用\n";
        echo "----------------------------------------\n\n";
        
        writeLog("备份失败: $backup_file", $log_file);
        exit(1);
    }
} else {
    // 浏览器模式
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>数据库备份工具</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 600px;
                width: 100%;
                padding: 40px;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 30px;
                font-size: 2rem;
            }
            .info {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .info-item:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: bold;
                color: #666;
            }
            .info-value {
                color: #333;
                word-break: break-all;
            }
            .message {
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-size: 1.1rem;
            }
            .success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 1.1rem;
                cursor: pointer;
                text-decoration: none;
                text-align: center;
                transition: transform 0.2s;
                margin-top: 20px;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
            .back-link {
                display: block;
                text-align: center;
                margin-top: 20px;
                color: #667eea;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🗄️ 数据库备份工具</h1>
            
            <div class="info">
                <div class="info-item">
                    <span class="info-label">数据库名称：</span>
                    <span class="info-value"><?php echo htmlspecialchars($DATABASE_NAME); ?></span>
                </div>
                <div class="info-item">
                    <span class="info-label">备份时间：</span>
                    <span class="info-value"><?php echo date('Y-m-d H:i:s'); ?></span>
                </div>
                <div class="info-item">
                    <span class="info-label">备份文件：</span>
                    <span class="info-value"><?php echo htmlspecialchars(basename($backup_file)); ?></span>
                </div>
            </div>
            
            <?php
            echo '<p style="text-align: center; color: #666; margin: 20px 0;">🔄 正在备份数据库，请稍候...</p>';
            
            if (backupDatabase($DATABASE_HOST, $DATABASE_USER, $DATABASE_PASS, $DATABASE_NAME, $backup_file)) {
                $file_size = filesize($backup_file);
                $file_size_mb = round($file_size / 1024 / 1024, 2);
                
                echo '<div class="message success">';
                echo '✅ 备份成功！<br><br>';
                echo "文件大小: $file_size_mb MB<br>";
                echo '保存位置: ' . htmlspecialchars($backup_file) . '<br><br>';
                
                // 清理旧备份
                $deleted = cleanOldBackups($BACKUP_DIR, $KEEP_DAYS);
                if ($deleted > 0) {
                    echo "🗑️ 已清理 $deleted 个30天前的旧备份";
                }
                
                echo '</div>';
                
                writeLog("备份成功: $backup_file ($file_size_mb MB)", $log_file);
                
                echo '<a href="admin.html" class="btn">返回后台管理</a>';
            } else {
                echo '<div class="message error">';
                echo '❌ 备份失败！<br><br>';
                echo '可能的原因：<br>';
                echo '1. MySQL 未启动<br>';
                echo '2. 数据库连接信息错误<br>';
                echo '3. mysqldump 命令不可用';
                echo '</div>';
                
                writeLog("备份失败: $backup_file", $log_file);
                
                echo '<a href="admin-login.html" class="btn">返回登录页</a>';
            }
            
            echo '<a href="index.html" class="back-link">返回首页</a>';
            ?>
        </div>
    </body>
    </html>
    <?php
}
?>

