<?php
// 文件上传API
// ============================================

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 创建上传目录
$uploadDir = '../images/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

try {
    // 检查请求方法
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('仅支持POST请求');
    }

    // 检查是否有文件上传
    if (!isset($_FILES['file'])) {
        throw new Exception('没有文件被上传');
    }

    $file = $_FILES['file'];
    $uploadType = isset($_POST['type']) ? $_POST['type'] : 'image'; // image 或 video

    // 验证文件类型
    $allowedTypes = [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video' => ['video/mp4', 'video/webm']
    ];
    
    $allowedExtensions = [
        'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'video' => ['mp4', 'webm']
    ];

    // 检查文件大小（10MB限制）
    $maxSize = 10 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        throw new Exception('文件大小超过10MB限制');
    }

    // 检查MIME类型
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes[$uploadType])) {
        throw new Exception('不允许的文件类型: ' . $mimeType);
    }

    // 生成唯一文件名
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (!in_array(strtolower($extension), $allowedExtensions[$uploadType])) {
        throw new Exception('不允许的文件扩展名: ' . $extension);
    }

    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // 移动文件
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('文件上传失败');
    }

    // 返回URL
    $url = 'images/uploads/' . $filename;
    
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename,
        'size' => $file['size']
    ], JSON_UNESCAPED_UNICODE);
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>


