// 公众号文章详情页面 JavaScript 功能（带分页）

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== 文章详情页面开始加载 ===');

    // 全局变量
    let allArticles = [];
    let currentFilter = 'all';
    let currentSearchTerm = '';

    // 分页配置
    let currentPage = 1;
    const itemsPerPage = 10; // 每页显示10篇文章
    let filteredArticles = []; // 当前筛选后的文章

    // 初始化页面
    initializePage();

    // 确保页面加载完成后激活"全部"标签
    setTimeout(() => {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const allTab = document.querySelector('[data-filter="all"]');
        if (allTab) {
            allTab.classList.add('active');
            console.log('✅ 已确保"全部"标签激活');
        }
    }, 100);

    // 初始化页面
    function initializePage() {
        console.log('开始初始化页面...');

        // 加载文章数据
        loadArticlesData();

        // 设置事件监听器
        setupEventListeners();

        console.log('页面初始化完成');
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 监听localStorage变化（跨标签页）
        window.addEventListener('storage', function (e) {
            if (e.key === 'homeData') {
                console.log('检测到homeData变化，重新加载文章');
                currentPage = 1; // 重置到第一页
                loadArticlesData();
            }
        });

        // 监听自定义的storage事件（同一标签页内）
        window.addEventListener('storageUpdate', function (e) {
            if (e.detail.key === 'homeData') {
                console.log('检测到同标签页homeData变化，重新加载文章');
                currentPage = 1; // 重置到第一页
                loadArticlesData();
            }
        });

        // 筛选功能
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const filter = this.dataset.filter;
                console.log('点击筛选标签:', filter);
                currentPage = 1; // 重置到第一页
                filterArticles(filter, currentSearchTerm);
            });
        });

        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');

        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            console.log('执行搜索:', searchTerm);
            currentSearchTerm = searchTerm;
            currentPage = 1; // 重置到第一页
            filterArticles(currentFilter, searchTerm);
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    // 加载文章数据
    async function loadArticlesData() {
        console.log('=== 开始加载文章数据 ===');

        try {
            // 首先尝试从数据库API获取数据
            const response = await fetch('api/get-data.php?type=articles');
            const result = await response.json();

            if (result.success && result.data && result.data.articles) {
                console.log('从数据库获取到文章数据:', result.data.articles.length, '篇');
                const articles = result.data.articles;

                // 保存到localStorage
                const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');
                homeData.articles = articles;
                localStorage.setItem('homeData', JSON.stringify(homeData));

                // 继续处理文章
                processArticlesData(articles);
                return;
            } else {
                console.log('数据库中没有文章数据，尝试从localStorage加载');
            }
        } catch (error) {
            console.error('从数据库加载失败:', error);
            console.log('尝试从localStorage加载');
        }

        // 从localStorage获取数据作为备用
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

        console.log('homeData:', homeData);
        console.log('adminData:', adminData);

        let articles = [];

        // 数据源优先级：homeData > adminData
        if (homeData.articles && Array.isArray(homeData.articles) && homeData.articles.length > 0) {
            articles = homeData.articles;
            console.log('使用homeData中的文章数据:', articles.length, '篇');
        } else if (adminData.articles && Array.isArray(adminData.articles) && adminData.articles.length > 0) {
            articles = adminData.articles;
            console.log('使用adminData中的文章数据:', articles.length, '篇');

            // 同步到homeData
            homeData.articles = articles;
            localStorage.setItem('homeData', JSON.stringify(homeData));
            console.log('已将adminData同步到homeData');
        } else {
            console.log('未找到文章数据');
            displayArticles([]);
            return;
        }

        // 处理文章数据
        processArticlesData(articles);
    }

    // 处理文章数据
    function processArticlesData(articles) {

        // 验证文章数据格式
        articles = articles.filter(article => {
            return article &&
                typeof article.title === 'string' &&
                typeof article.content === 'string' &&
                typeof article.category === 'string' &&
                typeof article.date === 'string';
        });

        console.log('验证后的文章数据:', articles);

        // 按时间排序（最新的在前）
        const sortedArticles = articles.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // 降序排列，最新的在前
        });

        console.log('排序后的文章:', sortedArticles);
        allArticles = sortedArticles; // 存储所有文章数据
        filteredArticles = sortedArticles; // 初始显示所有文章

        // 显示文章（带分页）
        displayArticles(filteredArticles);

        // 确保"全部"标签为激活状态
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const allTab = document.querySelector('[data-filter="all"]');
        if (allTab) {
            allTab.classList.add('active');
        }
    }

    // 显示文章（带分页）
    function displayArticles(articles) {
        console.log('=== 开始显示文章 ===');
        console.log('当前筛选:', currentFilter);
        console.log('要显示的文章总数:', articles.length);
        console.log('当前页码:', currentPage);

        const articlesList = document.getElementById('articles-list');
        if (!articlesList) {
            console.error('找不到文章列表容器 #articles-list');
            return;
        }

        articlesList.innerHTML = '';

        if (articles.length === 0) {
            console.log('没有文章要显示');
            articlesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>暂无文章</h3>
                    <p>请添加更多内容</p>
                </div>
            `;
            // 清空分页
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        // 计算分页信息
        const totalPages = Math.ceil(articles.length / itemsPerPage);

        // 确保当前页码在有效范围内
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        // 计算当前页显示的文章范围
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, articles.length);
        const currentArticles = articles.slice(startIndex, endIndex);

        console.log(`显示第 ${startIndex + 1}-${endIndex} 篇，共 ${articles.length} 篇`);

        // 渲染当前页的文章
        currentArticles.forEach((article, index) => {
            const articleItem = createArticleItem(article, startIndex + index);
            articlesList.appendChild(articleItem);
        });

        console.log('文章显示完成，当前页显示', currentArticles.length, '篇文章');

        // 渲染分页控件
        renderPagination(totalPages, articles.length);

        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 创建文章项目
    function createArticleItem(article, index) {
        const div = document.createElement('div');
        div.className = 'article-link-item';
        div.dataset.category = article.category;

        // 处理文章链接
        let linkHtml = '';
        if (article.link && article.link.trim()) {
            linkHtml = `
                <div class="article-link-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
        }

        div.innerHTML = `
            <a href="${article.link || '#'}" class="article-link" ${article.link ? 'target="_blank"' : ''}>
                <div class="article-link-content">
                    <div class="article-link-meta">
                        <span class="article-link-category">${article.category}</span>
                        <span class="article-link-date">${article.date}</span>
                    </div>
                    <h3 class="article-link-title">${article.title}</h3>
                    <p class="article-link-desc">${article.content}</p>
                </div>
                ${linkHtml}
            </a>
        `;

        return div;
    }

    // 渲染分页控件
    function renderPagination(totalPages, totalArticles) {
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
        const endItem = Math.min(currentPage * itemsPerPage, totalArticles);
        html += `<div class="pagination-info">
            显示 ${startItem}-${endItem} 条，共 ${totalArticles} 篇文章
        </div>`;

        pagination.innerHTML = html;
    }

    // 跳转到指定页（全局函数）
    window.goToPage = function (page) {
        currentPage = page;
        displayArticles(filteredArticles);
    };

    // 筛选文章
    function filterArticles(filter, searchTerm = '') {
        console.log('=== 开始筛选文章 ===');
        console.log('筛选条件:', filter);
        console.log('搜索词:', searchTerm);

        currentFilter = filter;

        // 更新按钮状态
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-filter="${filter}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        let filtered = allArticles;

        // 按分类筛选
        if (filter !== 'all') {
            filtered = filtered.filter(article => {
                return article.category === filter;
            });
            console.log('按分类筛选后:', filtered.length, '篇');
        }

        // 按搜索词筛选
        if (searchTerm) {
            filtered = filtered.filter(article => {
                const title = article.title.toLowerCase();
                const content = article.content.toLowerCase();
                const category = article.category.toLowerCase();
                return title.includes(searchTerm) ||
                    content.includes(searchTerm) ||
                    category.includes(searchTerm);
            });
            console.log('按搜索词筛选后:', filtered.length, '篇');
        }

        console.log('最终筛选结果:', filtered.length, '篇文章');

        filteredArticles = filtered;
        currentPage = 1; // 重置到第一页
        displayArticles(filtered);
    }

    // 全局调试函数
    window.refreshArticles = function () {
        console.log('手动刷新文章数据');
        currentPage = 1;
        loadArticlesData();
    };

    window.checkArticlesData = function () {
        console.log('=== 文章数据检查 ===');
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        console.log('homeData:', homeData);
        console.log('homeData.articles:', homeData.articles);
        console.log('adminData:', adminData);
        console.log('adminData.articles:', adminData.articles);
        console.log('当前显示的文章数量:', document.querySelectorAll('.article-link-item').length);
        console.log('allArticles长度:', allArticles.length);
        console.log('当前页码:', currentPage);
        console.log('每页显示:', itemsPerPage);
    };

    // 强制同步函数
    window.forceSyncArticles = function () {
        console.log('=== 强制同步文章数据 ===');
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');

        console.log('adminData.articles:', adminData.articles);

        if (adminData.articles && adminData.articles.length > 0) {
            console.log('从adminData同步到homeData');
            homeData.articles = adminData.articles;
            localStorage.setItem('homeData', JSON.stringify(homeData));
            console.log('同步完成，重新加载文章');
            currentPage = 1;
            loadArticlesData();
        } else {
            console.log('adminData中没有文章数据');
        }
    };

    console.log('=== 文章详情页面 JavaScript 已加载完成！ ===');
});
