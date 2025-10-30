<?php
// 获取文章和新闻数据的API
// ============================================

require_once 'config.php';

// 创建数据库连接
$database = new Database();
$conn = $database->getConnection();

try {
    // 获取请求类型
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';
    
    $result = [];
    
    // 获取文章数据
    if ($type === 'articles' || $type === 'all') {
        $sql = "SELECT 
                    id,
                    title,
                    content,
                    link,
                    category,
                    publish_date as date,
                    author,
                    created_at,
                    updated_at
                FROM articles 
                ORDER BY publish_date DESC, created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $articles = $stmt->fetchAll();
        
        // 格式化数据
        $result['articles'] = array_map(function($article) {
            // 将created_at转换为时间戳（毫秒数）
            $createdAt = 0;
            if (!empty($article['created_at'])) {
                $createdAt = strtotime($article['created_at']) * 1000; // 转换为毫秒
            }
            
            return [
                'id' => $article['id'],
                'title' => $article['title'],
                'content' => $article['content'],
                'link' => $article['link'],
                'category' => $article['category'],
                'date' => $article['date'],
                'author' => $article['author'] ?? '东方美谷韩国中心',
                'createdAt' => $createdAt
            ];
        }, $articles);
    }
    
    // 获取新闻数据
    if ($type === 'news' || $type === 'all') {
        $sql = "SELECT 
                    id,
                    title,
                    subtitle,
                    content,
                    event_date as date,
                    event_time as time,
                    location,
                    organizer,
                    co_organizer as coOrganizer,
                    sponsor,
                    core_function as coreFunction,
                    highlights,
                    event_goal,
                    participants,
                    event_scale,
                    event_fee,
                    contact_phone,
                    registration_link,
                    official_website,
                    category,
                    cover_image,
                    image,
                    video,
                    participants_list,
                    staff_list,
                    created_at,
                    updated_at
                FROM news 
                ORDER BY event_date DESC, created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $news = $stmt->fetchAll();
        
                // 格式化数据
        $result['news'] = array_map(function($item) {
            // 解析图片和视频数组
            $images = [];
            $videos = [];
            
            // 处理图片（可能是字符串或JSON）
            if (!empty($item['image'])) {
                $imageData = $item['image'];
                // 尝试解析为JSON数组
                if (strpos($imageData, '[') === 0) {
                    $decoded = json_decode($imageData, true);
                    $images = is_array($decoded) ? $decoded : [$imageData];
                } else {
                    $images = [$imageData];
                }
            }
            
            // 处理视频（可能是字符串或JSON）
            if (!empty($item['video'])) {
                $videoData = $item['video'];
                // 尝试解析为JSON数组
                if (strpos($videoData, '[') === 0) {
                    $decoded = json_decode($videoData, true);
                    $videos = is_array($decoded) ? $decoded : [$videoData];
                } else {
                    $videos = [$videoData];
                }
            }
            
            // 解析参与人员和工作人员列表
            $participantsList = [];
            $staffList = [];
            
            if (!empty($item['participants_list'])) {
                $decoded = json_decode($item['participants_list'], true);
                $participantsList = is_array($decoded) ? $decoded : [];
            } else {
                // 兼容旧格式：从participants字段解析
                if (!empty($item['participants'])) {
                    $participantsList = explode('\n', $item['participants']);
                    $participantsList = array_filter(array_map('trim', $participantsList));
                }
            }
            
            if (!empty($item['staff_list'])) {
                $decoded = json_decode($item['staff_list'], true);
                $staffList = is_array($decoded) ? $decoded : [];
            } else {
                // 兼容旧格式：如果有staff字段
                if (!empty($item['staff'])) {
                    $staffList = explode('\n', $item['staff']);
                    $staffList = array_filter(array_map('trim', $staffList));
                }
            }
            
            // 将created_at转换为时间戳（毫秒数）
            $createdAt = 0;
            if (!empty($item['created_at'])) {
                $createdAt = strtotime($item['created_at']) * 1000; // 转换为毫秒
            }
            
            return [
                'id' => $item['id'],
                'title' => $item['title'],
                'subtitle' => $item['subtitle'] ?? '', // 添加副标题字段
                'content' => $item['content'],
                'date' => $item['date'],
                'time' => $item['time'] ?? '',
                'location' => $item['location'],
                'organizer' => $item['organizer'],
                'coOrganizer' => $item['coOrganizer'] ?? '',
                'sponsor' => $item['sponsor'] ?? '',
                'coreFunction' => $item['coreFunction'],
                'highlights' => $item['highlights'] ?? '',
                'eventGoal' => $item['event_goal'] ?? '',
                'participants' => $item['participants'] ?? '',
                'eventScale' => $item['event_scale'] ?? '',
                'eventFee' => $item['event_fee'] ?? '',
                'contactPhone' => $item['contact_phone'] ?? '',
                'registrationLink' => $item['registration_link'] ?? '',
                'officialWebsite' => $item['official_website'] ?? '',
                'category' => $item['category'] ?? '活动新闻',
                'coverImage' => $item['cover_image'] ?? '',  // 封面图片
                'image' => count($images) > 0 ? $images : '',
                'video' => count($videos) > 0 ? $videos : '',
                'participantsList' => $participantsList,
                'staffList' => $staffList,
                'createdAt' => $createdAt
            ];
        }, $news);
    }
    
    // 返回成功响应
    successResponse($result, '数据获取成功');
    
} catch(Exception $e) {
    errorResponse('获取数据失败: ' . $e->getMessage(), 500);
} finally {
    $database->closeConnection();
}
?>


