<?php
// 图片上传API
// ============================================

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 创建上传目录（如果不存在）
$uploadDir = '../images/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// 允许的文件类型
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// 最大文件大小（10MB）
$maxSize = 10 * 1024 * 1024;

try {
    // 检查是否是POST请求
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('仅支持POST请求');
    }

    // 检查是否有文件上传
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('没有文件被上传');
    }

    $file = $_FILES['image'];

    // 检查文件大小
    if ($file['size'] > $maxSize) {
        throw new Exception('文件大小超过10MB限制');
    }

    // 检查文件类型
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('不允许的文件类型');
    }

    // 生成唯一文件名
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // 移动文件
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('文件上传失败');
    }

    // 返回文件URL
    $url = 'images/uploads/' . $filename;
    
    response(true, [
        'url' => $url,
        'filename' => $filename
    ], '上传成功');

} catch(Exception $e) {
    errorResponse($e->getMessage(), 400);
}

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

function errorResponse($message, $code = 400) {
    http_response_code($code);
    response(false, null, $message);
}
?>


