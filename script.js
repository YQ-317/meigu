// 中韩 JavaScript 交互功能

// 设置默认文章分类（必须在最开始设置，确保 home-data.js 可以使用）
window.currentCategory = '中韩新象';

// 数据库API配置
const API_CONFIG = {
    baseUrl: 'api/',
    timeout: 30000,
    retryTimes: 3
};

// 数据库API类
class DatabaseAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
    }

    // 发送请求
    async request(endpoint, method = 'GET', data = null) {
        const url = this.baseUrl + endpoint;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // 获取文章列表
    async getArticles() {
        // 使用正确的API端点
        const response = await fetch('api/get-data.php?type=articles');
        const result = await response.json();
        if (result.success && result.data && result.data.articles) {
            return { success: true, data: result.data.articles };
        }
        return { success: false, data: [] };
    }

    // 创建文章（不再使用此方法，改用manage-data.php）
    async createArticle(articleData) {
        return await this.request('articles', 'POST', articleData);
    }

    // 更新文章（不再使用此方法，改用manage-data.php）
    async updateArticle(id, articleData) {
        return await this.request(`articles/${id}`, 'PUT', articleData);
    }

    // 删除文章（不再使用此方法，改用manage-data.php）
    async deleteArticle(id) {
        return await this.request(`articles/${id}`, 'DELETE');
    }

    // 获取新闻列表
    async getNews() {
        // 使用正确的API端点
        const response = await fetch('api/get-data.php?type=news');
        const result = await response.json();
        if (result.success && result.data && result.data.news) {
            return { success: true, data: result.data.news };
        }
        return { success: false, data: [] };
    }

    // 创建新闻（不再使用此方法，改用manage-data.php）
    async createNews(newsData) {
        return await this.request('news', 'POST', newsData);
    }

    // 获取活动列表（活动就是新闻）
    async getActivities() {
        return await this.getNews();
    }

    // 创建活动（不再使用此方法）
    async createActivity(activityData) {
        return await this.request('activities', 'POST', activityData);
    }
}

// 创建API实例
const dbAPI = new DatabaseAPI();

// 测试数据库连接
async function testDatabaseConnection() {
    try {
        console.log('正在测试数据库连接...');
        const articles = await dbAPI.getArticles();
        console.log('✅ 数据库连接成功！', articles);
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        // 使用localStorage作为备用方案
        console.log('数据库连接失败,使用本地存储数据...');
        return false;
    }
}

// 从数据库加载文章数据
async function loadArticlesFromDatabase() {
    try {
        const articles = await dbAPI.getArticles();
        console.log('从数据库加载文章:', articles);

        // 更新页面显示
        updateArticlesDisplay(articles);
        return articles;
    } catch (error) {
        console.error('加载文章失败:', error);
        // 如果数据库连接失败，使用本地存储数据
        return loadArticlesFromLocalStorage();
    }
}

// 从数据库加载新闻数据
async function loadNewsFromDatabase() {
    try {
        const news = await dbAPI.getNews();
        console.log('从数据库加载新闻:', news);

        // 更新页面显示
        updateNewsDisplay(news);
        return news;
    } catch (error) {
        console.error('加载新闻失败:', error);
        // 如果数据库连接失败，使用本地存储数据
        return loadNewsFromLocalStorage();
    }
}

// 从数据库加载活动数据
async function loadActivitiesFromDatabase() {
    try {
        // 同时加载活动和新闻数据
        const [activities, news] = await Promise.all([
            dbAPI.getActivities(),
            dbAPI.getNews()
        ]);

        console.log('从数据库加载活动:', activities);
        console.log('从数据库加载新闻:', news);

        // 确保news和activities是数组
        const newsArray = Array.isArray(news) ? news : [];
        const activitiesArray = Array.isArray(activities) ? activities : [];

        // 合并活动和新闻数据，优先显示新闻
        const combinedData = [...newsArray, ...activitiesArray];

        // 更新页面显示
        updateActivitiesDisplay(combinedData);
        return combinedData;
    } catch (error) {
        console.error('加载活动/新闻失败:', error);
        // 如果数据库连接失败，使用本地存储数据
        return loadActivitiesFromLocalStorage();
    }
}

// 从本地存储加载活动数据
function loadActivitiesFromLocalStorage() {
    try {
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');

        // 优先使用news数据，如果没有则使用activities数据
        let data = [];
        if (homeData.news && homeData.news.length > 0) {
            data = homeData.news;
        } else if (homeData.activities && homeData.activities.length > 0) {
            data = homeData.activities;
        }

        console.log('从本地存储加载活动/新闻:', data);

        // 更新页面显示
        updateActivitiesDisplay(data);
        return data;
    } catch (error) {
        console.error('从本地存储加载活动/新闻失败:', error);
        return [];
    }
}

// 更新文章显示
function updateArticlesDisplay(articles) {
    const articlesContainer = document.querySelector('.articles-grid');
    if (!articlesContainer) return;

    articlesContainer.innerHTML = '';

    articles.forEach(article => {
        const articleElement = createArticleElement(article);
        articlesContainer.appendChild(articleElement);
    });
}

// 创建文章元素
function createArticleElement(article) {
    const div = document.createElement('div');
    div.className = 'article-card';
    div.innerHTML = `
        <div class="article-image">
            <img src="images/logo.jpg" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover;">
        </div>
        <div class="article-content">
            <h3>${article.title}</h3>
            <p>${article.content ? article.content.substring(0, 100) + '...' : ''}</p>
            <div class="article-meta">
                <span class="article-category">${article.category || '未分类'}</span>
                <span class="article-date">${new Date(article.date).toLocaleDateString()}</span>
            </div>
            ${article.link ? `<a href="${article.link}" target="_blank" class="btn btn-primary">阅读全文</a>` : ''}
        </div>
    `;
    return div;
}

// 更新新闻显示
function updateNewsDisplay(news) {
    const newsContainer = document.querySelector('.news-grid');
    if (!newsContainer) return;

    newsContainer.innerHTML = '';

    news.forEach(item => {
        const newsElement = createNewsElement(item);
        newsContainer.appendChild(newsElement);
    });
}

// 创建新闻元素
function createNewsElement(news) {
    const div = document.createElement('div');
    div.className = 'news-card';
    div.innerHTML = `
        <div class="news-image">
            <img src="${news.image || 'images/logo.jpg'}" alt="${news.title}" style="width: 100%; height: 200px; object-fit: cover;">
        </div>
        <div class="news-content">
            <h3>${news.title}</h3>
            <p>${news.content ? news.content.substring(0, 100) + '...' : ''}</p>
            <div class="news-meta">
                <span class="news-date">${new Date(news.date).toLocaleDateString()}</span>
            </div>
            <button class="btn btn-outline" onclick="viewNewsDetail(${news.id})">查看详情</button>
        </div>
    `;
    return div;
}

// 更新活动显示
function updateActivitiesDisplay(activities) {
    const activitiesContainer = document.querySelector('.activities-grid');
    if (!activitiesContainer) return;

    // 统一排序：按活动日期+开始时间降序；同一天按 createdAt 升序；再按原序
    const parseDate = (v) => {
        if (!v) return 0;
        let s = String(v).trim();
        s = s.replace(/年|\.|\//g, '-').replace(/月/g, '-').replace(/日/g, '');
        const t = Date.parse(s);
        return Number.isNaN(t) ? 0 : t;
    };
    const getTs = (act) => {
        const day = parseDate(act.date);
        if (!day) return 0;
        if (!act.time) return day;
        const m = String(act.time).match(/(\d{1,2}):(\d{2})/);
        if (!m) return day;
        const norm = String(act.date).trim().replace(/年|\.|\//g, '-').replace(/月/g, '-').replace(/日/g, '');
        const h = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const dt = new Date(norm);
        if (Number.isNaN(dt.getTime())) return day;
        dt.setHours(h || 0, mm || 0, 0, 0);
        return dt.getTime();
    };

    const sorted = (activities || [])
        .map((a, idx) => ({ a, idx }))
        .sort((x, y) => {
            const tA = getTs(x.a);
            const tB = getTs(y.a);
            if (tB !== tA) return tB - tA;
            const cA = typeof x.a.createdAt === 'number' ? x.a.createdAt : 0;
            const cB = typeof y.a.createdAt === 'number' ? y.a.createdAt : 0;
            if (cA !== cB) return cA - cB;
            return x.idx - y.idx;
        })
        .map(x => x.a);

    activitiesContainer.innerHTML = '';
    sorted.forEach(activity => {
        const el = createActivityElement(activity);
        activitiesContainer.appendChild(el);
    });
}

// 创建活动元素
function createActivityElement(activity) {
    const article = document.createElement('article');
    article.className = 'activity-card';

    // 构建媒体区域：只有在存在图片且不是视频时显示图片；否则不渲染图片容器
    let mediaHtml = '';
    if (activity.image && !String(activity.image).startsWith('data:video/')) {
        mediaHtml = `
        <div class="activity-image">
            <img src="${activity.image}" alt="${activity.title}" />
            <div class="activity-badge">${activity.category || '新闻'}</div>
        </div>`;
    }

    // 时间与地点
    const locationText = activity.location || '韩国中心';
    const dateText = activity.date ? new Date(activity.date).toLocaleDateString() : '';
    const idParam = encodeURIComponent(activity.id || activity.title);
    const byParam = activity.id ? 'id' : 'title';

    article.innerHTML = `
        ${mediaHtml}
        <div class="activity-content">
            ${!mediaHtml ? `<span class="activity-badge-inline">${activity.category || '新闻'}</span>` : ''}
            <h3 class="activity-title">${activity.title}</h3>
            <div class="activity-meta">
                <div class="activity-meta-item"><i class="fas fa-map-marker-alt"></i><span>${locationText}</span></div>
                <div class="activity-meta-item"><i class="fas fa-calendar"></i><span>${dateText}</span></div>
            </div>
            <a class="btn btn-outline" href="activity-detail.html?id=${idParam}&by=${byParam}&src=home">查看详情</a>
        </div>
    `;
    return article;
}

// 全局调试函数
window.showTestContent = function () {
    console.log('showTestContent 函数被调用');
    console.log('DOM状态:', document.readyState);
    console.log('查找 .activities-grid 元素...');

    const activitiesGrid = document.querySelector('.activities-grid');
    console.log('找到的元素:', activitiesGrid);

    if (activitiesGrid) {
        console.log('元素存在，开始插入内容...');
        activitiesGrid.innerHTML = `
            <article class="activity-card">
                <div class="activity-image">
                    <img src="images/logo.jpg" alt="测试活动" style="width: 100%; height: 250px; object-fit: cover;">
                    <div class="activity-badge">测试活动</div>
                </div>
                <div class="activity-content">
                    <h3>测试活动标题</h3>
                    <p>这是一个测试活动，用于验证图片显示功能是否正常工作。</p>
                    <div class="activity-meta">
                        <span class="activity-date"><i class="fas fa-calendar"></i> 2024年12月14日</span>
                        <span class="activity-location"><i class="fas fa-map-marker-alt"></i> 中国</span>
                    </div>
                    <button class="btn btn-outline" onclick="alert('测试按钮点击成功！')">查看详情</button>
                </div>
            </article>
        `;
        console.log('测试内容已显示');
        return true;
    } else {
        console.log('未找到活动网格容器');
        console.log('尝试查找所有可能的容器...');

        // 尝试查找其他可能的容器
        const containers = [
            document.querySelector('#activities'),
            document.querySelector('.activities-section'),
            document.querySelector('[class*="activities"]'),
            document.querySelector('[class*="grid"]')
        ];

        containers.forEach((container, index) => {
            console.log(`容器 ${index}:`, container);
        });

        return false;
    }
};


window.showTestContentDelayed = function () {
    console.log('延迟执行 showTestContent');
    setTimeout(function () {
        console.log('延迟执行中，DOM状态:', document.readyState);
        const activitiesGrid = document.querySelector('.activities-grid');
        console.log('延迟查找的元素:', activitiesGrid);

        if (activitiesGrid) {
            activitiesGrid.innerHTML = `
                <article class="activity-card">
                    <div class="activity-image">
                        <img src="images/logo.jpg" alt="延迟测试" style="width: 100%; height: 250px; object-fit: cover;">
                        <div class="activity-badge">延迟测试</div>
                    </div>
                    <div class="activity-content">
                        <h3>延迟测试活动标题</h3>
                        <p>这是延迟执行的测试活动。</p>
                        <div class="activity-meta">
                            <span class="activity-date"><i class="fas fa-calendar"></i> 2024年12月14日</span>
                            <span class="activity-location"><i class="fas fa-map-marker-alt"></i> 中国</span>
                        </div>
                        <button class="btn btn-outline" onclick="alert('延迟测试成功！')">查看详情</button>
                    </div>
                </article>
            `;
            console.log('延迟测试内容已显示');
        } else {
            console.log('延迟执行仍未找到容器');
        }
    }, 1000);
};

window.refreshHomeData = function () {
    console.log('refreshHomeData 函数被调用');
    if (typeof loadHomeData === 'function') {
        loadHomeData();
        console.log('数据已刷新');
    } else {
        console.log('loadHomeData函数未定义');
    }
};

// 检查页面状态
window.checkPageStatus = function () {
    console.log('=== 页面状态检查 ===');
    console.log('DOM加载状态:', document.readyState);
    console.log('活动网格是否存在:', !!document.querySelector('.activities-grid'));
    console.log('home-data.js是否加载:', typeof loadHomeData !== 'undefined');
    console.log('localStorage数据:', JSON.parse(localStorage.getItem('homeData') || '{}'));
    console.log('==================');
};

document.addEventListener('DOMContentLoaded', function () {
    // 移动端导航菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // 点击菜单项时关闭移动端菜单
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // 平滑滚动到锚点
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // 考虑导航栏高度
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop;
    });

    // 滚动动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll('.product-card, .news-card, .innovation-text, .innovation-image');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 产品卡片悬停效果增强
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 新闻卡片悬停效果增强
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px) scale(1.01)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 按钮点击效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            // 创建涟漪效果
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加涟漪效果样式
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 图片懒加载（修复版本）
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // 检查图片是否已经加载完成
                if (img.complete && img.naturalHeight !== 0) {
                    // 图片已经加载完成，直接显示
                    img.style.opacity = '1';
                } else {
                    // 图片未加载完成，设置透明并等待加载
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';

                    img.onload = function () {
                        this.style.opacity = '1';
                    };

                    // 如果图片加载失败，也要显示
                    img.onerror = function () {
                        this.style.opacity = '1';
                    };
                }

                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // 返回顶部按钮
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #ff6900;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(255, 105, 0, 0.3);
    `;

    document.body.appendChild(backToTopButton);

    // 显示/隐藏返回顶部按钮
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });

    // 返回顶部功能
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 悬停效果
    backToTopButton.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 20px rgba(255, 105, 0, 0.4)';
    });

    backToTopButton.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(255, 105, 0, 0.3)';
    });

    // 页面加载动画
    window.addEventListener('load', function () {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // 键盘导航支持
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // ESC键关闭移动端菜单
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        }
    });

    // 触摸设备优化
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');

        // 移除悬停效果在触摸设备上
        const hoverElements = document.querySelectorAll('.product-card, .news-card, .btn');
        hoverElements.forEach(element => {
            element.addEventListener('touchstart', function () {
                this.classList.add('touch-active');
            });

            element.addEventListener('touchend', function () {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 300);
            });
        });
    }

    // 性能优化：防抖滚动事件
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 应用防抖到滚动事件
    const debouncedScrollHandler = debounce(function () {
        // 滚动相关的处理逻辑
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler);

    // 折叠导航栏功能
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropdownToggle && dropdownContent) {
        dropdownToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function () {
            dropdownContent.classList.remove('show');
        });

        // 阻止下拉菜单内容点击时关闭
        dropdownContent.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // 查看活动详情
    window.viewActivityDetail = function (activityId) {
        window.location.href = `activity-detail.html?id=${activityId}`;
    };

    // 查看新闻详情
    window.viewNewsDetail = function (newsId) {
        window.location.href = `news-detail.html?id=${newsId}`;
    };

    // 页面加载完成后测试数据库连接
    console.log('页面加载完成，开始测试数据库连接...');

    // 检查是否在首页（有home-data.js处理数据加载）
    const isHomePage = document.querySelector('.activities-grid') && typeof window.loadHomeData === 'function';

    testDatabaseConnection().then(isConnected => {
        // 如果是首页，让home-data.js处理数据加载
        if (isHomePage) {
            console.log('首页：由home-data.js处理数据加载');
            return;
        }

        if (isConnected) {
            console.log('✅ 数据库连接成功，开始加载数据...');
            // 加载数据库数据
            if (!isArticlesDetailPage) {
                loadArticlesFromDatabase();
            }
            loadNewsFromDatabase();
            loadActivitiesFromDatabase();
        } else {
            console.log('❌ 数据库连接失败，使用本地存储数据...');
            // 使用本地存储数据（如果存在）
            if (!isArticlesDetailPage) {
                if (typeof loadArticlesFromLocalStorage === 'function') {
                    loadArticlesFromLocalStorage();
                } else {
                    // 直接调用updateArticlesDisplay来应用分类过滤
                    updateArticlesDisplay();
                }
            }
            if (typeof loadNewsFromLocalStorage === 'function') {
                loadNewsFromLocalStorage();
            }
            if (typeof loadActivitiesFromLocalStorage === 'function') {
                loadActivitiesFromLocalStorage();
            }
        }
    });

    // 监听localStorage变化
    window.addEventListener('storage', function (e) {
        if (e.key === 'homeData') {
            console.log('检测到homeData变化，重新加载数据');
            if (typeof loadArticlesFromLocalStorage === 'function') {
                loadArticlesFromLocalStorage();
            } else {
                updateArticlesDisplay();
            }
            if (typeof loadNewsFromLocalStorage === 'function') {
                loadNewsFromLocalStorage();
            }
            if (typeof loadActivitiesFromLocalStorage === 'function') {
                loadActivitiesFromLocalStorage();
            }
        }
    });

    // 监听自定义的storage事件（同一标签页内）
    window.addEventListener('storageUpdate', function (e) {
        if (e.detail.key === 'homeData') {
            console.log('检测到同标签页homeData变化，重新加载数据');
            if (typeof loadArticlesFromLocalStorage === 'function') {
                loadArticlesFromLocalStorage();
            } else {
                updateArticlesDisplay();
            }
            if (typeof loadNewsFromLocalStorage === 'function') {
                loadNewsFromLocalStorage();
            }
            if (typeof loadActivitiesFromLocalStorage === 'function') {
                loadActivitiesFromLocalStorage();
            }
        }
    });

    console.log('东方美谷 JavaScript 已加载完成！');
});

// 文章分类过滤功能（window.currentCategory 已在文件顶部定义）

// 检查是否为文章详情页
const isArticlesDetailPage = /articles-detail\.html$/i.test(location.pathname);

// 过滤文章
function filterArticles(category) {
    window.currentCategory = category;

    // 更新按钮状态
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    // 更新文章显示
    updateArticlesDisplay();
}

// 更新文章显示（带分类过滤）
function updateArticlesDisplay() {
    if (isArticlesDetailPage) return; // 避免覆盖文章详情页的列表渲染
    const articlesList = document.querySelector('.articles-list');
    if (!articlesList) return;

    // 获取文章数据
    let articles = [];
    const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

    if (homeData.articles && homeData.articles.length > 0) {
        articles = homeData.articles;
    } else if (adminData.articles && adminData.articles.length > 0) {
        articles = adminData.articles;
    }

    // 按分类过滤
    let filteredArticles = articles;
    if (window.currentCategory) {
        filteredArticles = articles.filter(article => article.category === window.currentCategory);
    }

    // 按日期排序并限制显示数量
    filteredArticles = filteredArticles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    if (filteredArticles.length === 0) {
        articlesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h3>暂无${window.currentCategory}文章</h3>
                <p>请添加更多内容</p>
            </div>
        `;
        return;
    }

    articlesList.innerHTML = filteredArticles.map(article => `
        <div class="article-link-item">
            <a href="${article.link}" class="article-link" target="_blank">
                <div class="article-link-content">
                    <div class="article-link-meta">
                        <span class="article-link-category">${article.category}</span>
                        <span class="article-link-date">${article.date}</span>
                    </div>
                    <h3 class="article-link-title">${article.title}</h3>
                    <p class="article-link-desc">${article.content}</p>
                </div>
                <div class="article-link-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </a>
        </div>
    `).join('');
}

