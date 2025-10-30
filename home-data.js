// 首页数据同步 JavaScript

// 全局调试函数
window.showTestContent = function () {
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
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
    } else {
        console.log('未找到活动网格容器');
    }
};

window.refreshHomeData = function () {
    console.log('手动刷新首页数据');
    loadHomeDataFromAPI();
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 首页DOM已加载，开始从API获取数据...');
    // 从API加载数据并更新首页（优先从数据库获取最新数据）
    loadHomeDataFromAPI();

    // 监听数据变化
    window.addEventListener('storage', function (e) {
        if (e.key === 'homeData') {
            console.log('检测到homeData变化，重新加载数据');
            loadHomeDataFromAPI();
        }
    });

    // 监听自定义的storage事件（同一标签页内）
    window.addEventListener('storageUpdate', function (e) {
        if (e.detail.key === 'homeData') {
            console.log('检测到同标签页homeData变化，重新加载数据');
            loadHomeDataFromAPI();
        }
    });

    // 从API加载数据
    async function loadHomeDataFromAPI() {
        console.log('=== 从API加载首页数据 ===');

        try {
            const apiUrl = 'https://meigu-1.onrender.com/get-data.php?type=all';
            console.log('📡 请求API:', apiUrl);
            const response = await fetch('https://meigu-1.onrender.com/get-data.php?type=all');
            console.log('📡 API响应状态:', response.status, response.statusText);

            const result = await response.json();
            console.log('📡 API返回数据:', result);

            if (result.success && result.data) {
                console.log('✅ API数据加载成功:', {
                    articles: result.data.articles?.length || 0,
                    news: result.data.news?.length || 0
                });

                // 注意：由于图片数据（base64）太大，不保存到localStorage
                // 每次页面加载都直接从API获取最新数据，避免QuotaExceededError

                try {
                    // 只保存数据加载时间戳，用于判断是否需要刷新
                    localStorage.setItem('lastDataLoadTime', Date.now().toString());
                    console.log('✅ 已记录数据加载时间');
                } catch (e) {
                    console.warn('⚠️ 无法保存加载时间:', e.message);
                }

                // 直接更新页面显示（不从localStorage）
                if (result.data.news && result.data.news.length > 0) {
                    console.log('使用API news数据:', result.data.news.length, '条');
                    updateActivities(result.data.news);
                } else {
                    console.log('没有找到新闻数据');
                    updateActivities([]);
                }

                // 更新公众号文章
                if (result.data.articles && result.data.articles.length > 0) {
                    console.log('使用API articles数据:', result.data.articles.length, '篇');
                    updateArticles(result.data.articles);
                } else {
                    console.log('没有找到文章数据');
                    updateArticles([]);
                }
            } else {
                console.error('❌ API返回失败:', result.message || '未知错误');
                console.error('❌ 完整错误信息:', result);
                // 如果API失败，尝试从localStorage加载
                loadHomeDataFromLocalStorage();
            }
        } catch (error) {
            console.error('❌ API请求异常:', error);
            console.error('❌ 异常详情:', error.message);

            // 如果是因为localStorage限制导致的错误，直接显示空数据提示
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ localStorage空间不足，将直接使用API数据，不缓存');
                // 重新尝试只更新显示，不保存缓存
                // （上面的代码已经处理了这个情况）
                return;
            }

            // 其他错误，显示提示
            alert('数据加载失败，请刷新页面重试。\n错误: ' + error.message);
        }
    }

    // 备用加载方案（通常不再使用，因为数据太大）
    function loadHomeDataFromLocalStorage() {
        console.log('=== 尝试从localStorage加载（备用方案） ===');
        console.log('⚠️ 注意：由于图片数据过大，localStorage可能为空');

        // localStorage通常为空（因为数据太大），直接显示提示
        updateActivities([]);
        updateArticles([]);
        console.warn('localStorage为空，无法加载缓存数据');
    }

    function updateActivities(activities) {
        console.log('=== updateActivities 被调用 ===');
        console.log('输入的活动数据:', activities);
        console.log('活动数据类型:', typeof activities);
        console.log('是否是数组:', Array.isArray(activities));

        const activitiesGrid = document.querySelector('.activities-grid');
        if (!activitiesGrid) {
            console.log('未找到活动网格容器');
            return;
        }

        // 清空现有内容
        activitiesGrid.innerHTML = '';

        if (!Array.isArray(activities) || activities.length === 0) {
            console.log('没有活动数据要显示，activities.length:', activities.length);
            activitiesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>暂无新闻</h3>
                    <p>请添加更多内容</p>
                </div>
            `;
            return;
        }

        console.log('✅ 有效活动数量:', activities.length);

        // 统一解析日期（兼容 2025/10/20、2025-10-20、2025年10月20日 等）
        const parseDate = (v) => {
            if (!v) return 0;
            let s = String(v).trim();
            s = s.replace(/年|\.|\//g, '-').replace(/月/g, '-').replace(/日/g, '');
            const t = Date.parse(s);
            return Number.isNaN(t) ? 0 : t;
        };

        // 计算活动时间戳：以活动日期+开始时间为准
        const getActivityTs = (act) => {
            const day = parseDate(act.date);
            if (!day) return 0;
            if (!act.time) return day;
            // 提取第一个时间段的开始时间 HH:MM
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

        // 按时间排序：先按日期降序；同一天按 createdAt 升序；仍相同按原始顺序
        const sortedActivities = activities
            .filter(activity => {
                const hasTitle = activity && activity.title;
                if (!hasTitle) {
                    console.log('⚠️ 过滤掉无效活动:', activity);
                }
                return hasTitle;
            })
            .map((a, idx) => ({ a, idx }))
            .sort((x, y) => {
                // 活动时间（日期+开始时间）降序
                const dA = getActivityTs(x.a);
                const dB = getActivityTs(y.a);
                if (dB !== dA) return dB - dA;
                const cA = typeof x.a.createdAt === 'number' ? x.a.createdAt : 0;
                const cB = typeof y.a.createdAt === 'number' ? y.a.createdAt : 0;
                console.log(`比较活动: "${x.a.title}" (createdAt: ${cA}) vs "${y.a.title}" (createdAt: ${cB})`);
                if (cA !== cB) return cA - cB;
                return x.idx - y.idx;
            })
            .map(x => x.a)
            .slice(0, 3); // 首页只显示最新3条新闻

        console.log('📊 排序后的活动:', sortedActivities);
        console.log('📊 sortedActivities 长度:', sortedActivities.length);
        console.log('📊 已限制为前3条（最新）显示在首页');

        // 清空现有内容
        activitiesGrid.innerHTML = '';

        // 添加活动卡片
        sortedActivities.forEach((activity, index) => {
            const activityCard = createActivityCard(activity, index);
            activitiesGrid.appendChild(activityCard);
            console.log(`添加活动卡片 ${index + 1}: ${activity.title}`);
        });

        console.log('活动显示完成，共显示', sortedActivities.length, '个活动');
        console.log('活动容器元素数量:', activitiesGrid.children.length);

        // 动态填充活动图片（避免base64字符串过长）
        setTimeout(() => {
            if (!window.activityImages) {
                console.error('window.activityImages 不存在');
                return;
            }

            console.log('开始填充活动图片，活动总数:', sortedActivities.length);
            console.log('window.activityImages 大小:', window.activityImages.size);

            sortedActivities.forEach((activity, idx) => {
                // 首先检查是否有封面图数据（避免为没有图片的活动查找容器）
                const hasCoverImage = !!(activity.coverImage || activity.cover_image ||
                    (activity.image && !String(activity.image).startsWith('data:video/')));

                if (!hasCoverImage) {
                    console.log(`⏭️  活动 ${idx} "${activity.title}" - 无封面图，跳过`);
                    return;
                }

                // 尝试多种ID格式匹配
                const possibleIds = [
                    String(activity.id || ''),
                    String(activity.title || ''),
                    String(idx)
                ].filter(id => id);

                console.log(`🔍 活动 ${idx} "${activity.title}" - 尝试ID:`, possibleIds);

                let imgContainer = null;
                let matchedId = '';

                for (const id of possibleIds) {
                    imgContainer = activitiesGrid.querySelector(`[data-activity-id="${id}"]`);
                    if (imgContainer) {
                        matchedId = id;
                        console.log(`  ✓ 找到容器，使用ID: "${id}"`);
                        break;
                    }
                }

                if (!imgContainer) {
                    console.error(`  ❌ 未找到容器，尝试的ID:`, possibleIds);
                    console.error(`  DOM中的容器:`, Array.from(activitiesGrid.querySelectorAll('[data-activity-id]')).map(el => el.getAttribute('data-activity-id')));
                    return;
                }

                // 从Map中查找图片
                let imageUrl = null;
                for (const id of possibleIds) {
                    imageUrl = window.activityImages.get(id);
                    if (imageUrl) {
                        console.log(`  ✓ 找到图片URL，来源ID: "${id}"，大小: ${(imageUrl.length / 1024).toFixed(2)}KB`);
                        break;
                    }
                }

                if (!imageUrl) {
                    console.warn(`  ⚠️ 没有封面图，Map中的键:`, Array.from(window.activityImages.keys()));
                    console.warn(`  尝试的ID:`, possibleIds);
                    const placeholder = imgContainer.querySelector('div[style*="加载中"]');
                    if (placeholder) {
                        placeholder.innerHTML = '暂无封面图';
                        placeholder.style.display = 'flex';
                    }
                    return;
                }

                if (imageUrl.startsWith('data:video/')) {
                    console.warn(`活动 ${idx} 封面图是视频，跳过`);
                    return;
                }

                const img = imgContainer.querySelector('img[data-src]');
                if (!img) {
                    console.error(`活动 ${idx} 未找到img元素`);
                    return;
                }

                // 验证并设置图片URL（与后台使用相同的逻辑）
                let finalSrc = imageUrl;
                if (!imageUrl.startsWith('data:')) {
                    finalSrc = 'data:image/png;base64,' + imageUrl;
                }

                // 直接使用图片URL（与后台保持一致）
                img.src = finalSrc;

                // 查找loadingDiv（通过文本内容查找）
                console.log(`  🔍 查找loadingDiv...`);
                let loadingDiv = null;
                // 方法1：查找包含"加载中"文本的div
                const allDivs = imgContainer.querySelectorAll('div');
                for (const div of allDivs) {
                    if (div.textContent && div.textContent.includes('加载中')) {
                        loadingDiv = div;
                        break;
                    }
                }
                console.log(`  loadingDiv:`, loadingDiv);
                console.log(`  imgContainer中的div数量:`, allDivs.length);

                img.onload = function () {
                    console.log(`  ✅ 封面图加载成功`);
                    // 显示图片并隐藏加载指示器
                    this.style.display = 'block';
                    if (loadingDiv) {
                        console.log(`  ✓ 隐藏loadingDiv`);
                        loadingDiv.style.display = 'none';
                    } else {
                        console.warn(`  ⚠️ 未找到loadingDiv`);
                    }
                };

                img.onerror = function (e) {
                    console.error(`  ❌ 封面图加载失败`);
                    // 显示简洁的错误提示（与后台保持一致）
                    if (loadingDiv) {
                        loadingDiv.innerHTML = '<div style="color: #999; font-size: 0.9rem;">暂无图片</div>';
                        loadingDiv.style.display = 'flex';
                    } else {
                        // 如果没有loadingDiv，创建一个错误提示
                        this.parentElement.innerHTML = '<div style="color: #999; font-size: 0.9rem;">暂无图片</div>';
                    }
                };
            });
        }, 100);
    }

    function updateArticles(articles) {
        const articlesList = document.querySelector('.articles-list');
        if (!articlesList) {
            console.log('未找到文章列表容器');
            return;
        }

        // 清空现有内容
        articlesList.innerHTML = '';

        if (!Array.isArray(articles) || articles.length === 0) {
            console.log('没有文章数据要显示');
            const categoryName = window.currentCategory || '文章';
            articlesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>暂无${categoryName}文章</h3>
                    <p>请添加更多内容</p>
                </div>
            `;
            return;
        }

        // 过滤有效文章
        let filteredArticles = articles.filter(article => article && article.title);

        // 按分类过滤（如果设置了分类）
        if (window.currentCategory) {
            filteredArticles = filteredArticles.filter(article => article.category === window.currentCategory);
        }

        // 如果过滤后没有文章，显示空状态
        if (filteredArticles.length === 0) {
            const categoryName = window.currentCategory || '文章';
            articlesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>暂无${categoryName}文章</h3>
                    <p>请添加更多内容</p>
                </div>
            `;
            return;
        }

        // 按时间排序文章（最新的在前）并只取最新的6个
        const sortedArticles = filteredArticles
            .sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA; // 降序排列，最新的在前
            })
            .slice(0, 6); // 只取前6个

        console.log('排序后的文章:', sortedArticles);

        // 添加文章
        sortedArticles.forEach((article, index) => {
            const articleItem = createArticleItem(article, index);
            articlesList.appendChild(articleItem);
        });

        console.log('文章显示完成，共显示', sortedArticles.length, '篇文章');
    }

    function createActivityCard(activity, index) {
        const article = document.createElement('article');
        article.className = 'activity-card';
        article.style.cssText = 'visibility: visible; display: block;';

        // 优先使用封面图，其次使用活动图片
        let imageUrl = '';
        if (activity.coverImage) {
            imageUrl = activity.coverImage;
        } else if (activity.cover_image) {
            imageUrl = activity.cover_image;
        } else if (activity.image && !activity.image.startsWith('data:video/')) {
            if (Array.isArray(activity.image) && activity.image.length > 0) {
                imageUrl = activity.image[0];
            } else if (typeof activity.image === 'string') {
                imageUrl = activity.image;
            }
        }

        // 判断媒体类型 - 保存图片URL到全局变量，避免在HTML中直接使用base64
        let mediaElement = '';
        if (imageUrl && !imageUrl.startsWith('data:video/')) {
            // 存储图片URL到window.activityImages全局变量
            if (!window.activityImages) {
                window.activityImages = new Map();
            }
            // 使用统一的ID格式：优先使用id，其次使用title，最后使用index
            const activityId = String(activity.id || activity.title || index);

            // 直接存储图片URL（数据库字段已修改为MEDIUMTEXT，可支持大图片）
            window.activityImages.set(activityId, imageUrl);
            console.log(`📷 存储图片: id="${activityId}", title="${activity.title}", index=${index}, 大小=${(imageUrl.length / 1024).toFixed(2)}KB`);

            // 使用简单的占位符，避免在HTML中插入长标题
            mediaElement = `
                <div class="activity-image" data-activity-id="${activityId}" style="width: 100%; height: 200px; position: relative; background: #f0f0f0; border-radius: 8px 8px 0 0; overflow: hidden;">
                    <img data-src="${activityId}" alt="Activity Cover" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.9rem; position: absolute; top: 0; left: 0; background: #f0f0f0;">加载中...</div>
                    <div class="activity-badge">${getActivityBadge(activity)}</div>
                </div>
            `;
        } else {
            // 如果没有图片，在内容区域显示内联徽章
            mediaElement = '';
        }

        // 如果activity.image是数组，也更新判断
        let hasImage = !!imageUrl;

        // 处理位置信息
        const locationText = activity.location || '韩国中心';

        // 处理时间信息
        const timeText = activity.time ? `${activity.date} ${activity.time}` : activity.date;

        article.innerHTML = `
            ${mediaElement}
            <div class="activity-content">
                ${!hasImage ? `<span class="activity-badge-inline">${getActivityBadge(activity)}</span>` : ''}
                <h3 class="activity-title">${activity.title}</h3>
                <div class="activity-meta">
                    <div class="activity-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${locationText}</span>
                    </div>
                    <div class="activity-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${timeText}</span>
                    </div>
                </div>
                <button class="btn btn-outline" onclick="window.location.href='activity-detail.html?id=${encodeURIComponent(activity.id || activity.title)}&by=${activity.id ? 'id' : 'title'}'">查看详情</button>
            </div>
        `;
        return article;
    }

    function createArticleItem(article, index) {
        const div = document.createElement('div');
        div.className = 'article-link-item';
        div.innerHTML = `
            <a href="${article.link || 'articles-detail.html'}" class="article-link" ${article.link ? 'target="_blank"' : ''}>
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
        `;
        return div;
    }

    function getActivityBadge(activity) {
        // 如果有category字段，优先使用
        if (activity.category) {
            return activity.category;
        }

        // 根据活动类型返回不同的标签
        if (activity.title.includes('博览会') || activity.title.includes('展览')) {
            return '博览会';
        } else if (activity.title.includes('研讨会') || activity.title.includes('论坛')) {
            return '研讨会';
        } else if (activity.title.includes('发布会') || activity.title.includes('新品')) {
            return '新品发布';
        } else if (activity.title.includes('合作') || activity.title.includes('签约')) {
            return '合作活动';
        }
        return '新闻';
    }

    // 初始化默认数据（如果localStorage中没有数据）
    function initializeDefaultData() {
        const homeData = JSON.parse(localStorage.getItem('homeData') || '{}');

        if (!homeData.activities) {
            homeData.activities = [
                {
                    title: '2024中韩美妆产业博览会',
                    content: '汇聚中韩两国顶尖美妆品牌，展示最新产品和技术，促进产业交流合作。活动期间将举办多场专业论坛和产品发布会。',
                    date: '2024年4月15-17日',
                    time: '09:00-17:00',
                    location: '上海国际展览中心',
                    image: 'images/logo.jpg',
                    type: 'exhibition',
                    highlights: '汇聚中韩两国顶尖美妆品牌\n展示最新产品和技术\n专业论坛和产品发布会\n行业专家现场分享',
                    audience: '美妆行业从业者、品牌方代表、经销商、媒体记者、美妆爱好者等',
                    schedule: '09:00-09:30 开幕式及致辞\n09:30-12:00 品牌展示及产品体验\n14:00-16:00 专业论坛及技术分享\n16:00-17:00 互动交流及总结',
                    participants: '500-800人',
                    fee: '免费（需提前报名）',
                    contact: '400-888-9999',
                    website: 'www.orientalbeauty.com'
                },
                {
                    title: '韩式美妆技术研讨会',
                    content: '邀请韩国知名美妆专家分享最新技术趋势，包括护肤科技、彩妆创新等前沿内容，为行业从业者提供学习交流平台。',
                    date: '2024年3月28日',
                    time: '09:00-16:00',
                    location: '东方美谷韩国中心',
                    image: 'images/logo.jpg',
                    type: 'seminar',
                    highlights: '韩国知名美妆专家分享\n最新技术趋势解析\n护肤科技前沿内容\n彩妆创新技术展示',
                    audience: '美妆行业从业者、技术研发人员、产品经理、品牌方代表等',
                    schedule: '09:00-09:30 签到及欢迎致辞\n09:30-11:00 技术趋势主题演讲\n11:00-12:00 互动讨论及问答\n14:00-16:00 实践操作及体验',
                    participants: '100-200人',
                    fee: '200元/人',
                    contact: '400-888-9999',
                    website: 'www.orientalbeauty.com'
                },
                {
                    title: '韩国美妆品牌新品发布会',
                    content: '多家韩国知名美妆品牌联合发布2024年春季新品，包括护肤、彩妆、个护等多个品类，为消费者带来最新潮流体验。',
                    date: '2024年3月20日',
                    time: '14:00-16:30',
                    location: '线上直播',
                    image: 'images/logo.jpg',
                    type: 'launch',
                    highlights: '多家韩国知名品牌联合发布\n2024年春季新品展示\n护肤、彩妆、个护全品类\n最新潮流体验',
                    audience: '媒体记者、美妆博主、消费者、品牌方代表等',
                    schedule: '14:00-14:30 媒体签到及茶歇\n14:30-15:00 品牌介绍及新品发布\n15:00-16:00 产品体验及互动\n16:00-16:30 媒体采访及交流',
                    participants: '50-100人',
                    fee: '免费（仅限邀请）',
                    contact: '400-888-9999',
                    website: 'www.orientalbeauty.com'
                }
            ];
        }

        if (!homeData.articles) {
            homeData.articles = [
                {
                    title: '韩式护肤的10个秘诀，让你拥有水润肌肤',
                    content: '韩国女性为什么皮肤这么好？揭秘韩式护肤的核心秘诀，从清洁到保湿，教你打造完美肌肤。',
                    link: 'https://mp.weixin.qq.com/s/example1',
                    category: '中韩新象',
                    date: '2024年3月18日'
                },
                {
                    title: '2024年春季韩式彩妆趋势解析',
                    content: '从清透底妆到自然眉形，从温柔眼妆到水润唇妆，带你了解2024年最in的韩式彩妆趋势。',
                    link: 'https://mp.weixin.qq.com/s/example2',
                    category: '趋势前瞻',
                    date: '2024年3月15日'
                },
                {
                    title: '韩国小众美妆品牌推荐，性价比超高',
                    content: '除了大牌，韩国还有很多小众但优质的美妆品牌，今天为大家推荐几个性价比超高的韩国美妆品牌。',
                    link: 'https://mp.weixin.qq.com/s/example3',
                    category: '美谷韩讯',
                    date: '2024年3月12日'
                },
                {
                    title: '2024年美妆行业发展趋势预测',
                    content: '分析2024年美妆行业的发展趋势，包括技术创新、消费者需求变化、市场格局调整等方面。',
                    link: 'https://mp.weixin.qq.com/s/example4',
                    category: '趋势前瞻',
                    date: '2024年3月10日'
                },
                {
                    title: '韩式护肤成分大解析：透明质酸、烟酰胺、维C',
                    content: '详细介绍韩式护肤中常用的有效成分，包括透明质酸、烟酰胺、维生素C等，教你如何选择适合自己的护肤产品。',
                    link: 'https://mp.weixin.qq.com/s/example5',
                    category: '中韩新象',
                    date: '2024年3月8日'
                }
            ];
        }

        localStorage.setItem('homeData', JSON.stringify(homeData));
    }

    // 查看活动详情
    window.viewActivityDetail = function (activityId) {
        window.location.href = `activity-detail.html?id=${activityId}`;
    };

    // 初始化默认数据
    initializeDefaultData();

    // 页面加载完成后立即加载数据
    // 注意：loadHomeDataFromAPI 已经在DOMContentLoaded开头调用了

    console.log('首页数据同步 JavaScript 已加载完成！');
    console.log('当前homeData:', JSON.parse(localStorage.getItem('homeData') || '{}'));
});

// 暴露全局刷新函数
window.loadHomeData = function () {
    // 兼容旧代码
    if (typeof loadHomeDataFromAPI === 'function') {
        loadHomeDataFromAPI();
    }
};