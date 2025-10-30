<?php
// CORS 允许跨域访问（Vercel 前端 -> Render 后端）
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 通过环境变量配置数据库（优先使用环境变量，未配置则回退到 Railway 外网连接参数）
$db_host = getenv('DB_HOST');
$db_name = getenv('DB_NAME');
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$db_port = getenv('DB_PORT');

// 回退到你的 Railway 配置（外网可访问）
if (!$db_host) { $db_host = 'yamabiko.proxy.rlwy.net'; }
if (!$db_port) { $db_port = '58636'; }
if (!$db_name) { $db_name = 'railway'; }
if (!$db_user) { $db_user = 'root'; }
if (!$db_pass) { $db_pass = 'exGjRufguFHcjRrTGWhqkhnYwUrbJPSj'; }

$dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => '数据库连接失败: ' . $e->getMessage()]);
    exit;
}

// 提供与现有代码兼容的简单 Database 封装
class Database {
    private PDO $pdo;
    public function __construct() {
        global $pdo; // 复用上面已建立的连接
        $this->pdo = $pdo;
    }
    public function getConnection(): PDO {
        return $this->pdo;
    }
    public function closeConnection(): void {
        $this->pdo = null;
    }
}

// 响应函数
function response($success, $data = null, $message = '') {
    $response = ['success' => $success];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    if ($message) {
        $response['message'] = $message;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 错误响应
function errorResponse($message, $code = 400) {
    http_response_code($code);
    response(false, null, $message);
}

// 成功响应
function successResponse($data = null, $message = '') {
    response(true, $data, $message);
}
?>


