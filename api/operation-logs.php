<?php
// 操作日志API
// ============================================

require_once 'config.php';

// 处理OPTIONS预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 创建数据库连接
$database = new Database();
$conn = $database->getConnection();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // 获取操作日志
        $action = isset($_GET['action']) ? $_GET['action'] : 'all';
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 1000;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        
        // 构建SQL查询
        if ($action === 'all') {
            $sql = "SELECT * FROM operation_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$limit, $offset]);
        } else {
            $sql = "SELECT * FROM operation_logs WHERE action = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$action, $limit, $offset]);
        }
        
        $logs = $stmt->fetchAll();
        
        // 获取总数
        if ($action === 'all') {
            $countStmt = $conn->query("SELECT COUNT(*) as total FROM operation_logs");
        } else {
            $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM operation_logs WHERE action = ?");
            $countStmt->execute([$action]);
        }
        $total = $countStmt->fetch()['total'];
        
        successResponse([
            'logs' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ], '获取日志成功');
        
    } else if ($method === 'POST') {
        // 添加操作日志
        $postData = json_decode(file_get_contents('php://input'), true);
        
        $action = isset($postData['action']) ? $postData['action'] : '';
        $title = isset($postData['title']) ? $postData['title'] : '';
        $details = isset($postData['details']) ? $postData['details'] : '';
        $user = isset($postData['user']) ? $postData['user'] : '';
        $createdAt = isset($postData['createdAt']) ? intval($postData['createdAt']) : time() * 1000;
        
        if (empty($action) || empty($title) || empty($user)) {
            errorResponse('缺少必要参数', 400);
        }
        
        // 插入日志
        $sql = "INSERT INTO operation_logs (action, title, details, user, created_at) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$action, $title, $details, $user, $createdAt]);
        
        $logId = $conn->lastInsertId();
        
        successResponse([
            'id' => $logId,
            'action' => $action,
            'title' => $title,
            'user' => $user
        ], '日志添加成功');
        
    } else if ($method === 'DELETE') {
        // 删除日志
        $deleteData = json_decode(file_get_contents('php://input'), true);
        
        if (isset($deleteData['id'])) {
            // 删除指定ID的日志
            $id = intval($deleteData['id']);
            $sql = "DELETE FROM operation_logs WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id]);
            
            successResponse(null, '日志删除成功');
            
        } else if (isset($deleteData['clear_all']) && $deleteData['clear_all'] === true) {
            // 清空所有日志
            $sql = "TRUNCATE TABLE operation_logs";
            $conn->exec($sql);
            
            successResponse(null, '所有日志已清空');
            
        } else {
            errorResponse('缺少必要参数', 400);
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





