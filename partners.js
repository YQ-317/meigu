// 合作单位页面 JavaScript 功能

document.addEventListener('DOMContentLoaded', function () {
    // 合作单位分类筛选
    const categoryBtns = document.querySelectorAll('.category-btn');
    const partnerCards = document.querySelectorAll('.partner-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;

            // 更新活动按钮
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 筛选合作单位卡片
            partnerCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 合作申请按钮
    const applyBtn = document.querySelector('.btn-primary');
    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            showApplyModal();
        });
    }

    // 显示合作申请模态框
    function showApplyModal() {
        const modal = document.createElement('div');
        modal.className = 'apply-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>合作申请</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form class="apply-form">
                            <div class="form-group">
                                <label for="companyName">公司名称</label>
                                <input type="text" id="companyName" name="companyName" required>
                            </div>
                            <div class="form-group">
                                <label for="contactPerson">联系人</label>
                                <input type="text" id="contactPerson" name="contactPerson" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">联系电话</label>
                                <input type="tel" id="phone" name="phone" required>
                            </div>
                            <div class="form-group">
                                <label for="email">邮箱地址</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="cooperationType">合作类型</label>
                                <select id="cooperationType" name="cooperationType" required>
                                    <option value="">请选择合作类型</option>
                                    <option value="government">政府机构</option>
                                    <option value="academic">学术机构</option>
                                    <option value="industry">行业协会</option>
                                    <option value="enterprise">企业单位</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="description">合作描述</label>
                                <textarea id="description" name="description" rows="4" placeholder="请描述您的合作意向和需求"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary cancel-modal">取消</button>
                        <button class="btn btn-primary submit-apply">提交申请</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .apply-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                position: relative;
                z-index: 10001;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-close:hover {
                color: #333;
            }
            
            .apply-form {
                display: grid;
                gap: 20px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
            }
            
            .form-group label {
                margin-bottom: 8px;
                font-weight: 500;
                color: #333;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #ff6900;
            }
            
            .modal-footer {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
        `;
        document.head.appendChild(style);

        // 事件监听
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.querySelector('.cancel-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.querySelector('.submit-apply').addEventListener('click', () => {
            const form = modal.querySelector('.apply-form');
            const formData = new FormData(form);

            // 这里可以添加表单验证和提交逻辑
            console.log('提交合作申请:', Object.fromEntries(formData));

            showNotification('合作申请已提交，我们将尽快与您联系！', 'success');

            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        // 点击遮罩层关闭
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 30px;
                background: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid #ff6900;
            }
            
            .notification-success {
                border-left-color: #28a745;
            }
            
            .notification-info {
                border-left-color: #17a2b8;
            }
            
            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }

    // 添加淡入动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    console.log('合作单位页面 JavaScript 已加载完成！');
});










