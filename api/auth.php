<?php
// 用户认证API
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
    
    if ($method === 'POST') {
        // 获取POST数据
        $postData = json_decode(file_get_contents('php://input'), true);
        $action = isset($postData['action']) ? $postData['action'] : '';
        
        if ($action === 'login') {
            // 登录验证
            $username = isset($postData['username']) ? trim($postData['username']) : '';
            $password = isset($postData['password']) ? $postData['password'] : '';
            
            if (empty($username) || empty($password)) {
                errorResponse('用户名和密码不能为空', 400);
            }
            
            // 查询用户（包含role字段）
            $sql = "SELECT id, username, password, role FROM users WHERE username = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if (!$user) {
                errorResponse('用户名或密码错误', 401);
            }
            
            // 验证密码（简单比对，实际应用中应使用password_hash和password_verify）
            if ($user['password'] !== $password) {
                errorResponse('用户名或密码错误', 401);
            }
            
            // 登录成功，返回用户信息（优化：缓存结果）
            $response = [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => isset($user['role']) ? $user['role'] : 'admin',
                'avatar' => strtoupper(substr($user['username'], 0, 1))
            ];
            
            successResponse($response, '登录成功');
            
        } else if ($action === 'get_user_info') {
            // 获取用户信息（用于刷新权限）
            $user_id = isset($postData['user_id']) ? intval($postData['user_id']) : 0;
            $username = isset($postData['username']) ? trim($postData['username']) : '';
            
            if (empty($username) && $user_id <= 0) {
                errorResponse('缺少用户标识', 400);
            }
            
            // 查询用户信息
            if ($user_id > 0) {
                $sql = "SELECT id, username, role FROM users WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$user_id]);
            } else {
                $sql = "SELECT id, username, role FROM users WHERE username = ?";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$username]);
            }
            
            $user = $stmt->fetch();
            
            if (!$user) {
                errorResponse('用户不存在', 404);
            }
            
            // 返回用户信息
            successResponse([
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => isset($user['role']) ? $user['role'] : 'admin',
                'avatar' => strtoupper(substr($user['username'], 0, 1))
            ], '获取用户信息成功');
            
        } else if ($action === 'logout') {
            // 登出（如果需要服务端处理）
            successResponse(null, '登出成功');
            
        } else if ($action === 'check') {
            // 检查登录状态（如果使用session）
            successResponse(['logged_in' => false], '未登录');
            
        } else {
            errorResponse('无效的操作');
        }
        
    } else {
        errorResponse('不支持的请求方法', 405);
    }
    
} catch(Exception $e) {
    errorResponse('认证失败: ' . $e->getMessage(), 500);
} finally {
    $database->closeConnection();
}
?>

