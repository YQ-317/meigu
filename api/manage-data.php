<?php
// 管理数据的API（增删改查）
// ============================================

require_once 'config.php';

// 创建数据库连接
$database = new Database();
$conn = $database->getConnection();

try {
    // 获取请求方法
    $method = $_SERVER['REQUEST_METHOD'];
    
    // 获取请求的数据类型
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    // 获取POST数据
    $postData = json_decode(file_get_contents('php://input'), true);
    
    // 路由处理
    switch ($method) {
        case 'GET':
            // 查询数据
            handleGet($conn, $type, $id);
            break;
            
        case 'POST':
            // 创建数据
            handlePost($conn, $type, $postData);
            break;
            
        case 'PUT':
            // 更新数据
            handlePut($conn, $type, $id, $postData);
            break;
            
        case 'DELETE':
            // 删除数据
            handleDelete($conn, $type, $id);
            break;
            
        default:
            errorResponse('不支持的请求方法', 405);
    }
    
} catch(Exception $e) {
    errorResponse('操作失败: ' . $e->getMessage(), 500);
} finally {
    $database->closeConnection();
}

// ============================================
// GET - 查询数据
// ============================================
function handleGet($conn, $type, $id) {
    if ($type === 'articles') {
        if ($id > 0) {
            // 查询单篇文章
            $sql = "SELECT * FROM articles WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id]);
            $article = $stmt->fetch();
            
            if ($article) {
                successResponse($article);
            } else {
                errorResponse('文章不存在', 404);
            }
        } else {
            // 查询所有文章
            $sql = "SELECT * FROM articles ORDER BY publish_date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $articles = $stmt->fetchAll();
            successResponse($articles);
        }
    } elseif ($type === 'news') {
        if ($id > 0) {
            // 查询单条新闻
            $sql = "SELECT * FROM news WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$id]);
            $news = $stmt->fetch();
            
            if ($news) {
                successResponse($news);
            } else {
                errorResponse('新闻不存在', 404);
            }
        } else {
            // 查询所有新闻
            $sql = "SELECT * FROM news ORDER BY event_date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $news = $stmt->fetchAll();
            successResponse($news);
        }
    } else {
        errorResponse('无效的数据类型');
    }
}

// ============================================
// POST - 创建数据
// ============================================
function handlePost($conn, $type, $data) {
    if ($type === 'articles') {
        // 验证必填字段
        $required = ['title', 'content', 'link', 'category', 'publish_date'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                errorResponse("缺少必填字段: {$field}");
            }
        }
        
        // 插入文章
        $sql = "INSERT INTO articles (title, content, link, category, publish_date, author) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['content'],
            $data['link'],
            $data['category'],
            $data['publish_date'],
            $data['author'] ?? '东方美谷韩国中心'
        ]);
        
        $newId = $conn->lastInsertId();
        successResponse(['id' => $newId], '文章创建成功');
        
    } elseif ($type === 'news') {
        // 验证必填字段
        $required = ['title', 'content', 'event_date', 'location', 'organizer', 'core_function'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                errorResponse("缺少必填字段: {$field}");
            }
        }
        
        // 处理图片和视频数组（转换为JSON字符串）
        $imageValue = is_array($data['image'] ?? null) ? json_encode($data['image']) : ($data['image'] ?? '');
        $videoValue = is_array($data['video'] ?? null) ? json_encode($data['video']) : ($data['video'] ?? '');
        
        // 处理人员列表数组（转换为JSON字符串）
        $participantsListValue = is_array($data['participants_list'] ?? null) ? json_encode($data['participants_list']) : ($data['participants_list'] ?? '[]');
        $staffListValue = is_array($data['staff_list'] ?? null) ? json_encode($data['staff_list']) : ($data['staff_list'] ?? '[]');
        
        // 插入新闻
        $sql = "INSERT INTO news (
                title, subtitle, content, event_date, event_time, location, organizer, 
                co_organizer, sponsor, core_function, highlights, event_goal, 
                participants, event_scale, event_fee, contact_phone, 
                registration_link, official_website, category, cover_image, 
                image, video, participants_list, staff_list
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['subtitle'] ?? '',
            $data['content'],
            $data['event_date'],
            $data['event_time'] ?? '',
            $data['location'],
            $data['organizer'],
            $data['co_organizer'] ?? '',
            $data['sponsor'] ?? '',
            $data['core_function'],
            $data['highlights'] ?? '',
            $data['event_goal'] ?? '',
            $data['participants'] ?? '',
            $data['event_scale'] ?? '',
            $data['event_fee'] ?? '',
            $data['contact_phone'] ?? '',
            $data['registration_link'] ?? '',
            $data['official_website'] ?? '',
            $data['category'] ?? '活动新闻',
            $data['cover_image'] ?? '',
            $imageValue,
            $videoValue,
            $participantsListValue,
            $staffListValue
        ]);
        
        $newId = $conn->lastInsertId();
        successResponse(['id' => $newId], '新闻创建成功');
        
    } else {
        errorResponse('无效的数据类型');
    }
}

// ============================================
// PUT - 更新数据
// ============================================
function handlePut($conn, $type, $id, $data) {
    if ($id <= 0) {
        errorResponse('无效的ID');
    }
    
    if ($type === 'articles') {
        // 更新文章
        $sql = "UPDATE articles 
                SET title = ?, content = ?, link = ?, category = ?, 
                    publish_date = ?, author = ?
                WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['content'],
            $data['link'],
            $data['category'],
            $data['publish_date'],
            $data['author'] ?? '东方美谷韩国中心',
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            successResponse(null, '文章更新成功');
        } else {
            errorResponse('文章不存在或未修改', 404);
        }
        
    } elseif ($type === 'news') {
        // 处理图片和视频数组
        $imageValue = is_array($data['image'] ?? null) ? json_encode($data['image']) : ($data['image'] ?? '');
        $videoValue = is_array($data['video'] ?? null) ? json_encode($data['video']) : ($data['video'] ?? '');
        
        // 处理人员列表数组
        $participantsListValue = is_array($data['participants_list'] ?? null) ? json_encode($data['participants_list']) : ($data['participants_list'] ?? '[]');
        $staffListValue = is_array($data['staff_list'] ?? null) ? json_encode($data['staff_list']) : ($data['staff_list'] ?? '[]');
        
        // 更新新闻
        $sql = "UPDATE news 
                SET title = ?, subtitle = ?, content = ?, event_date = ?, event_time = ?, 
                    location = ?, organizer = ?, co_organizer = ?, sponsor = ?,
                    core_function = ?, highlights = ?, event_goal = ?,
                    participants = ?, event_scale = ?, event_fee = ?, 
                    contact_phone = ?, registration_link = ?, official_website = ?,
                    category = ?, cover_image = ?, 
                    image = ?, video = ?, participants_list = ?, staff_list = ?
                WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['subtitle'] ?? '',
            $data['content'],
            $data['event_date'],
            $data['event_time'] ?? '',
            $data['location'],
            $data['organizer'],
            $data['co_organizer'] ?? '',
            $data['sponsor'] ?? '',
            $data['core_function'],
            $data['highlights'] ?? '',
            $data['event_goal'] ?? '',
            $data['participants'] ?? '',
            $data['event_scale'] ?? '',
            $data['event_fee'] ?? '',
            $data['contact_phone'] ?? '',
            $data['registration_link'] ?? '',
            $data['official_website'] ?? '',
            $data['category'] ?? '活动新闻',
            $data['cover_image'] ?? '',
            $imageValue,
            $videoValue,
            $participantsListValue,
            $staffListValue,
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            successResponse(null, '新闻更新成功');
        } else {
            errorResponse('新闻不存在或未修改', 404);
        }
        
    } else {
        errorResponse('无效的数据类型');
    }
}

// ============================================
// DELETE - 删除数据
// ============================================
function handleDelete($conn, $type, $id) {
    if ($id <= 0) {
        errorResponse('无效的ID');
    }
    
    if ($type === 'articles') {
        // 删除文章
        $sql = "DELETE FROM articles WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            successResponse(null, '文章删除成功');
        } else {
            errorResponse('文章不存在', 404);
        }
        
    } elseif ($type === 'news') {
        // 删除新闻
        $sql = "DELETE FROM news WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            successResponse(null, '新闻删除成功');
        } else {
            errorResponse('新闻不存在', 404);
        }
        
    } else {
        errorResponse('无效的数据类型');
    }
}
?>


