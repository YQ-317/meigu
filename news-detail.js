// 新闻列表页（带分页功能）

// 分页配置
let currentPage = 1; // 当前页码
const itemsPerPage = 10; // 每页显示数量
let allNews = []; // 所有新闻数据
let isInitialLoad = true; // 是否是首次加载

document.addEventListener('DOMContentLoaded', function () {
    loadNewsData();

    // 同步监听
    window.addEventListener('storage', e => {
        if (e.key === 'homeData') {
            currentPage = 1; // 数据更新时重置到第一页
            loadNewsData();
        }
    });
    window.addEventListener('storageUpdate', e => {
        if (e.detail && e.detail.key === 'homeData') {
            currentPage = 1;
            loadNewsData();
        }
    });
});

// 从API加载新闻数据
async function loadNewsData() {
    console.log('=== 从API加载新闻数据 ===');

    try {
        // 首先尝试从数据库API获取数据
        const response = await fetch('https://meigu-1.onrender.com/get-data.php?type=news');
        const result = await response.json();

        if (result.success && result.data && result.data.news) {
            console.log('✅ 从数据库获取到新闻数据:', result.data.news.length, '条');
            const news = result.data.news;

            // 注意：由于图片数据（base64）太大，不保存到localStorage
            // 直接使用API数据渲染，避免QuotaExceededError
            try {
                // 只保存加载时间戳
                localStorage.setItem('lastNewsLoadTime', Date.now().toString());
                console.log('✅ 已记录新闻加载时间');
            } catch (e) {
                console.warn('⚠️ 无法保存加载时间（不影响显示）:', e.message);
            }

            // 直接渲染新闻
            renderNews(news);
            return;
        } else {
            console.log('数据库中没有新闻数据，尝试从localStorage加载');
        }
    } catch (error) {
        console.error('❌ 从数据库加载失败:', error);

        // 如果是QuotaExceededError，说明之前尝试保存时失败，但不影响显示
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠️ localStorage空间不足，直接使用API数据，不缓存');
            // 尝试重新获取数据并只显示，不保存
            const response = await fetch('https://meigu-1.onrender.com/get-data.php?type=news');
            const result = await response.json();
            if (result.success && result.data && result.data.news) {
                renderNews(result.data.news);
                return;
            }
        }

        console.log('尝试从localStorage加载备用数据');
    }

    // 从localStorage获取数据作为备用（通常为空，因为数据太大）
    console.log('⚠️ 尝试从localStorage加载备用数据（可能为空）');
    try {
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');
        const list = Array.isArray(homeData.news) ? homeData.news : [];
        console.log('localStorage中的数据数量:', list.length);
        renderNews(list);
    } catch (e) {
        console.error('localStorage读取失败:', e);
        renderNews([]);
    }
}

function renderNews(list) {
    console.log('=== renderNews 开始 ===');
    console.log('接收到的 list:', list);
    console.log('list 长度:', list ? list.length : 0);

    const container = document.getElementById('news-list');
    if (!container) {
        console.error('找不到 #news-list 容器');
        return;
    }

    container.innerHTML = '';

    if (!list || list.length === 0) {
        console.log('列表为空，显示空状态');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>暂无新闻</h3>
                <p>请在后台添加新闻</p>
            </div>
        `;
        // 清空分页
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // 按时间降序排序
    const parseDate = (v) => {
        if (!v) return 0;
        let s = String(v).trim();
        s = s.replace(/年|\.|\//g, '-').replace(/月/g, '-').replace(/日/g, '');
        const t = Date.parse(s);
        return Number.isNaN(t) ? 0 : t;
    };

    console.log('开始排序，原始数据数量:', list.length);

    // 对要渲染的新闻进行排序（使用list）
    const sorted = [...list]
        .map((a, idx) => ({ a, idx }))
        .sort((x, y) => {
            const dA = parseDate(x.a.date);
            const dB = parseDate(y.a.date);
            if (dB !== dA) return dB - dA;
            const cA = typeof x.a.createdAt === 'number' ? x.a.createdAt : 0;
            const cB = typeof y.a.createdAt === 'number' ? y.a.createdAt : 0;
            if (cA !== cB) return cA - cB;
            return x.idx - y.idx;
        })
        .map(x => x.a);

    console.log('排序完成，排序后数据数量:', sorted.length);

    // 更新 allNews 为排序后的数据
    allNews = sorted;

    // 使用排序后的数据
    const finalNews = sorted;

    // 计算分页信息
    const totalPages = Math.ceil(finalNews.length / itemsPerPage);

    // 确保当前页码在有效范围内
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    // 计算当前页显示的新闻范围
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, finalNews.length);
    const currentNews = finalNews.slice(startIndex, endIndex);

    console.log('分页信息：当前页', currentPage, '，总共', totalPages, '页');
    console.log('显示范围：', startIndex, '-', endIndex);

    // 渲染当前页的新闻
    currentNews.forEach((news, i) => {
        const article = document.createElement('article');
        article.className = 'news-item';

        // 优先使用封面图，其次使用活动图片
        let imageUrl = '';
        if (news.coverImage) {
            imageUrl = news.coverImage;
        } else if (news.cover_image) {
            imageUrl = news.cover_image;
        } else if (news.image && !String(news.image).startsWith('data:video/')) {
            imageUrl = news.image;
        }

        // 仅图片（非视频）才显示
        let media = '';
        if (imageUrl && !imageUrl.startsWith('data:video/')) {
            media = `
                <div class="news-image">
                    <img src="${imageUrl}" alt="${news.title}" onerror="console.error('图片加载失败')">
                    <div class="news-badge">${news.category || '新闻'}</div>
                </div>
            `;
        }

        const dateText = news.date || '';
        const locationText = news.location || '韩国中心';

        article.innerHTML = `
            ${media}
            <div class="news-content">
                ${!media ? `<span class="article-category">${news.category || '新闻'}</span>` : ''}
                <h3>${news.title}</h3>
                <div class="news-meta">
                    <span class="news-date"><i class="fas fa-calendar"></i> ${dateText}</span>
                    <span class="news-location"><i class="fas fa-map-marker-alt"></i> ${locationText}</span>
                </div>
                <a class="btn btn-outline" href="activity-detail.html?id=${encodeURIComponent(news.id || news.title)}&by=${news.id ? 'id' : 'title'}">查看详情</a>
            </div>
        `;

        container.appendChild(article);
    });

    // 渲染分页控件
    renderPagination(totalPages);

    // 只在初次加载时滚动到顶部
    if (isInitialLoad) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        isInitialLoad = false;
    }
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    // 如果只有一页或没有数据，不显示分页
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-container">';

    // 上一页按钮
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> 上一页
        </button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled>
            <i class="fas fa-chevron-left"></i> 上一页
        </button>`;
    }

    // 页码按钮
    const maxButtons = 8; // 最多显示8个页码按钮
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxButtons) {
        // 计算显示范围
        const halfButtons = Math.floor(maxButtons / 2);
        startPage = Math.max(1, currentPage - halfButtons);
        endPage = Math.min(totalPages, startPage + maxButtons - 1);

        // 调整起始页
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
    }

    // 第一页
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="pagination-btn active">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }

    // 最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 下一页按钮
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">
            下一页 <i class="fas fa-chevron-right"></i>
        </button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled>
            下一页 <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    html += '</div>';

    // 添加分页信息
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, finalNews.length);
    html += `<div class="pagination-info">
        显示 ${startItem}-${endItem} 条，共 ${finalNews.length} 条新闻
    </div>`;

    pagination.innerHTML = html;
}

// 跳转到指定页（全局函数）
window.goToPage = function (page) {
    currentPage = page;
    // 重新渲染时不重置滚动位置
    isInitialLoad = false;
    // 使用当前的 allNews 重新渲染
    if (allNews && allNews.length > 0) {
        renderNews(allNews);
    }
};
