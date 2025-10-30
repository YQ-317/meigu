// 活动详情页 JavaScript

let currentActivity = null;
let currentImageIndex = 0;
let currentImageList = [];

// 页面加载时获取URL参数
document.addEventListener('DOMContentLoaded', function () {
    console.log('活动详情页加载');

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

    // 绑定返回顶部按钮
    initScrollToTop();
});

// 从API加载活动详情
async function loadActivityDetail(id, by) {
    try {
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

    // 处理图片 - 封面图单独存储，不添加到图片列表
    let images = [];
    let coverImageUrl = '';

    // 优先使用封面图
    if (activity.coverImage) {
        coverImageUrl = activity.coverImage;
    } else if (activity.cover_image) {
        coverImageUrl = activity.cover_image;
    }

    // 处理图片数组（不包括封面图）
    if (Array.isArray(activity.image)) {
        images = activity.image;
    } else if (activity.image && !activity.image.startsWith('data:video/')) {
        images = [activity.image];
    }

    // 如果有封面图，要从图片列表中移除（避免重复显示）
    if (coverImageUrl) {
        images = images.filter(img => img !== coverImageUrl);
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
        coverImage: coverImageUrl,
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
    document.title = `${activity.title} - 东方美谷韩国中心`;

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

    // 设置信息卡片
    renderInfoCards(activity);

    // 设置活动内容
    if (activity.content) {
        document.getElementById('contentSection').style.display = 'block';
        document.getElementById('activityContent').innerHTML = activity.content;
    }

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

// 渲染信息卡片
function renderInfoCards(activity) {
    const container = document.getElementById('infoCardsContent');
    let hasInfo = false;
    let html = '';

    // 先检查容器是否存在
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

    // 活动费用只在后台显示，首页不显示

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
                <div class="media-item" onclick="openImageModal(${index}, 'image')">
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
function openImageModal(index, type) {
    if (!currentActivity || !currentActivity.images || currentActivity.images.length === 0) return;

    const modal = document.getElementById('imageModal');
    currentImageList = currentActivity.images;
    currentImageIndex = index;

    updateImageModal();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 更新模态框内容
function updateImageModal() {
    const content = document.getElementById('imageModalContent');
    if (currentImageList.length === 0) return;

    const currentImage = currentImageList[currentImageIndex];
    content.innerHTML = `<img src="${currentImage}" alt="活动照片">`;
}

// 关闭图片模态框
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 上一张图片
function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = currentImageList.length - 1;
    }
    updateImageModal();
}

// 下一张图片
function nextImage() {
    if (currentImageIndex < currentImageList.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateImageModal();
}

// 显示未找到
function showNotFound() {
    document.getElementById('activityTitle').textContent = '活动未找到';
    document.querySelector('.core-info-meta').innerHTML = '<p style="text-align: center; color: #999;">未找到指定的活动，请返回首页浏览其他活动。</p>';
}

// 初始化返回顶部功能
function initScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');

    // 监听滚动
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 键盘导航
document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('imageModal');
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeImageModal();
    } else if (e.key === 'ArrowLeft') {
        previousImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

// 点击模态框外部关闭
document.getElementById('imageModal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeImageModal();
    }
});

