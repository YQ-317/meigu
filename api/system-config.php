<?php
// 系统配置API
// ============================================

require_once 'config.php';

// 创建数据库连接
$database = new Database();
$conn = $database->getConnection();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // 获取配置
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        if ($action === 'check_max_packet') {
            // 检查当前 max_allowed_packet 设置
            $stmt = $conn->query("SHOW VARIABLES LIKE 'max_allowed_packet'");
            $result = $stmt->fetch();
            
            if ($result) {
                successResponse([
                    'variable' => $result['Variable_name'],
                    'value' => (int)$result['Value'],
                    'valueMB' => round($result['Value'] / 1024 / 1024, 2) . 'MB'
                ], '获取配置成功');
            } else {
                errorResponse('无法获取配置');
            }
        } else {
            errorResponse('无效的操作');
        }
        
    } else if ($method === 'POST') {
        // 设置配置
        $postData = json_decode(file_get_contents('php://input'), true);
        $action = isset($postData['action']) ? $postData['action'] : '';
        
        if ($action === 'set_max_packet') {
            $value = isset($postData['value']) ? (int)$postData['value'] : 67108864;
            
            // 设置 max_allowed_packet
            $stmt = $conn->prepare("SET GLOBAL max_allowed_packet = ?");
            $stmt->execute([$value]);
            
            // 验证设置
            $stmt = $conn->query("SHOW VARIABLES LIKE 'max_allowed_packet'");
            $result = $stmt->fetch();
            
            successResponse([
                'value' => (int)$result['Value'],
                'valueMB' => round($result['Value'] / 1024 / 1024, 2) . 'MB'
            ], '设置成功');
        } else {
            errorResponse('无效的操作');
        }
        
    } else {
        errorResponse('不支持的请求方法', 405);
    }
    
} catch(Exception $e) {
    errorResponse('操作失败: ' . $e->getMessage(), 500);
} finally {
    $database->closeConnection();
}
?>






