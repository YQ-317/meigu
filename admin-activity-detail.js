// 活动详情页 JavaScript（后台管理版本）- 显示完整信息包括费用

let currentActivity = null;
let currentImageIndex = 0;
let currentImageList = [];

// 页面加载时获取URL参数
document.addEventListener('DOMContentLoaded', function () {
    console.log('活动详情页加载（后台版本）');

    // 获取URL参数
    const params = new URLSearchParams(window.location.search);
    const activityId = params.get('id');
    const by = params.get('by') || 'id';

    console.log('URL参数:', { id: activityId, by });

    if (activityId) {
        loadActivityDetail(activityId, by);
    } else {
        showNotFound();
    }
});

// 从API加载活动详情
async function loadActivityDetail(id, by) {
    const loadingContainer = document.getElementById('loadingContainer');
    const activityContent = document.getElementById('activityContent');

    try {
        loadingContainer.style.display = 'block';
        const response = await fetch('api/get-data.php?type=news');
        const result = await response.json();

        if (result.success && result.data && result.data.news) {
            const activities = result.data.news;

            // 根据ID查找活动
            let activity = null;
            if (by === 'id') {
                activity = activities.find(a => String(a.id) === String(id));
            } else {
                activity = activities.find(a => a.title === id);
            }

            if (activity) {
                currentActivity = formatActivityData(activity);
                loadingContainer.style.display = 'none';
                activityContent.style.display = 'block';
                renderActivityDetail(currentActivity);
            } else {
                showNotFound();
            }
        } else {
            showNotFound();
        }
    } catch (error) {
        console.error('加载活动详情失败:', error);
        showNotFound();
    }
}

// 格式化活动数据
function formatActivityData(activity) {
    // 处理参与人员和工作人员
    let participants = [];
    let staff = [];

    if (activity.participantsList && Array.isArray(activity.participantsList)) {
        participants = activity.participantsList;
    } else if (typeof activity.participants === 'string' && activity.participants.trim()) {
        participants = activity.participants.split('\n').filter(p => p.trim());
    } else if (Array.isArray(activity.participants)) {
        participants = activity.participants;
    }

    if (activity.staffList && Array.isArray(activity.staffList)) {
        staff = activity.staffList;
    } else if (typeof activity.staff === 'string' && activity.staff.trim()) {
        staff = activity.staff.split('\n').filter(s => s.trim());
    } else if (Array.isArray(activity.staff)) {
        staff = activity.staff;
    }

    // 处理图片
    let images = [];
    if (Array.isArray(activity.image)) {
        images = activity.image;
    } else if (activity.image && !activity.image.startsWith('data:video/')) {
        images = [activity.image];
    }

    // 处理视频
    let videos = [];
    if (Array.isArray(activity.video)) {
        videos = activity.video;
    } else if (activity.video) {
        videos = [activity.video];
    }

    return {
        id: activity.id,
        title: activity.title || '活动详情',
        subtitle: activity.subtitle || '',
        date: activity.date || '',
        time: activity.time || '',
        location: activity.location || '',
        organizer: activity.organizer || '',
        coOrganizer: activity.coOrganizer || '',
        sponsor: activity.sponsor || '',
        purpose: activity.purpose || activity.eventGoal || '',
        eventGoal: activity.eventGoal || '',
        content: activity.content || '',
        coreFunction: activity.coreFunction || '',
        highlights: activity.highlights || '',
        participants: participants,
        staff: staff,
        images: images,
        videos: videos,
        participantsCount: activity.participants || '',
        eventScale: activity.eventScale || '',
        eventFee: activity.eventFee || '',
        contactPhone: activity.contactPhone || '',
        registrationLink: activity.registrationLink || '',
        officialWebsite: activity.officialWebsite || ''
    };
}

// 渲染活动详情
function renderActivityDetail(activity) {
    document.title = `${activity.title} - 东方美谷韩国中心（管理）`;

    // 设置标题
    document.getElementById('activityTitle').textContent = activity.title;

    if (activity.subtitle) {
        const subtitleEl = document.getElementById('activitySubtitle');
        subtitleEl.textContent = activity.subtitle;
        subtitleEl.style.display = 'block';
    }

    // 设置基础信息
    const timeText = activity.date || '待定';
    document.getElementById('activityDate').textContent = timeText;
    document.getElementById('activityLocation').textContent = activity.location || '待定';
    document.getElementById('activityOrganizer').textContent = activity.organizer || '待定';

    // 设置活动目的
    if (activity.purpose || activity.eventGoal) {
        document.getElementById('purposeSection').style.display = 'block';
        document.getElementById('activityPurpose').innerHTML = activity.purpose || activity.eventGoal || '';
    }

    // 设置活动内容
    if (activity.content) {
        document.getElementById('contentSection').style.display = 'block';
        document.getElementById('activityContentText').innerHTML = activity.content;
    }

    // 设置信息卡片（包含费用）
    renderInfoCards(activity);

    // 设置参与人员
    if (activity.participants && activity.participants.length > 0 || activity.staff && activity.staff.length > 0) {
        document.getElementById('participantsSection').style.display = 'block';
        renderParticipants(activity);
    }

    // 设置多媒体
    if (activity.images && activity.images.length > 0 || activity.videos && activity.videos.length > 0) {
        document.getElementById('mediaSection').style.display = 'block';
        renderMedia(activity);
    }
}

// 渲染参与人员
function renderParticipants(activity) {
    const container = document.getElementById('participantsContent');
    let html = '';

    if (activity.participants && activity.participants.length > 0) {
        html += `
            <div class="participant-category">
                <span class="category-label">现场参与人员</span>
                <ul class="participant-list">
                    ${activity.participants.map(p => `<li><i class="fas fa-user"></i>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (activity.staff && activity.staff.length > 0) {
        html += `
            <div class="participant-category">
                <span class="category-label">工作人员</span>
                <ul class="participant-list">
                    ${activity.staff.map(s => `<li><i class="fas fa-user-tie"></i>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    container.innerHTML = html;
}

// 渲染信息卡片（后台版本 - 包含活动费用）
function renderInfoCards(activity) {
    const container = document.getElementById('infoCardsContent');
    let hasInfo = false;
    let html = '';

    if (!container) {
        console.warn('infoCardsContent 容器不存在');
        return;
    }

    if (activity.coreFunction) {
        html += `<div class="info-card">
            <div class="info-icon"><i class="fas fa-star"></i></div>
            <h4>核心功能</h4>
            <p>${activity.coreFunction}</p>
        </div>`;
        hasInfo = true;
    }

    if (activity.highlights) {
        html += `<div class="info-card">
            <div class="info-icon"><i class="fas fa-fire"></i></div>
            <h4>活动亮点</h4>
            <p>${activity.highlights}</p>
        </div>`;
        hasInfo = true;
    }

    if (activity.coOrganizer) {
        html += `<div class="info-card">
            <div class="info-icon"><i class="fas fa-hands-helping"></i></div>
            <h4>联合组织者</h4>
            <p>${activity.coOrganizer}</p>
        </div>`;
        hasInfo = true;
    }

    if (activity.eventScale) {
        html += `<div class="info-card">
            <div class="info-icon"><i class="fas fa-users"></i></div>
            <h4>活动规模</h4>
            <p>${activity.eventScale}</p>
        </div>`;
        hasInfo = true;
    }

    if (activity.eventFee) {
        html += `<div class="info-card">
            <div class="info-icon"><i class="fas fa-dollar-sign"></i></div>
            <h4>活动费用</h4>
            <p>${activity.eventFee}</p>
        </div>`;
        hasInfo = true;
    }

    container.innerHTML = html;

    if (hasInfo) {
        document.getElementById('infoCardsSection').style.display = 'block';
    }
}

// 渲染多媒体
function renderMedia(activity) {
    const container = document.getElementById('mediaGallery');
    let html = '';

    // 渲染图片
    if (activity.images && activity.images.length > 0) {
        activity.images.forEach((img, index) => {
            html += `
                <div class="media-item" onclick="openImageModal(${index})">
                    <img src="${img}" alt="活动照片" loading="lazy">
                    <span class="media-badge">
                        <i class="fas fa-image"></i> 照片
                    </span>
                </div>
            `;
        });
    }

    // 渲染视频
    if (activity.videos && activity.videos.length > 0) {
        activity.videos.forEach((video, index) => {
            html += `
                <div class="media-item">
                    <video controls style="width: 100%; height: 100%;">
                        <source src="${video}" type="video/mp4">
                    </video>
                    <span class="media-badge">
                        <i class="fas fa-video"></i> 视频
                    </span>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

// 打开图片模态框
function openImageModal(index) {
    if (!currentActivity || !currentActivity.images || currentActivity.images.length === 0) return;

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    modalImage.src = currentActivity.images[index];
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭图片模态框
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 显示未找到
function showNotFound() {
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.innerHTML = `
        <div class="error-container">
            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="error-title">活动未找到</div>
            <div class="error-message">未找到指定的活动，请返回后台管理页面。</div>
            <a href="admin.html" class="btn-nav btn-back" style="display: inline-flex;">
                <i class="fas fa-arrow-left"></i> 返回后台
            </a>
        </div>
    `;
}

