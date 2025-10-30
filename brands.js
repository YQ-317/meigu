// 品牌页面 JavaScript 功能

document.addEventListener('DOMContentLoaded', function () {
    // 品牌图片数据
    const brandImages = [
        {
            src: 'images/logo.jpg',
            alt: '合作品牌1',
            title: '品牌1'
        },
        {
            src: 'images/logo.jpg',
            alt: '合作品牌2',
            title: '品牌2'
        },
        {
            src: 'images/logo.jpg',
            alt: '合作品牌3',
            title: '品牌3'
        },
        {
            src: 'images/logo.jpg',
            alt: '合作品牌4',
            title: '品牌4'
        },
        {
            src: 'images/logo.jpg',
            alt: '合作品牌5',
            title: '品牌5'
        },
        {
            src: 'images/logo.jpg',
            alt: '合作品牌6',
            title: '品牌6'
        }
    ];

    // 渲染品牌图片
    function renderBrandImages() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        brandImages.forEach((brand, index) => {
            const brandItem = document.createElement('div');
            brandItem.className = 'brand-item';
            brandItem.innerHTML = `
                <div class="brand-image-container">
                    <img src="${brand.src}" alt="${brand.alt}" class="brand-image">
                    <div class="brand-overlay">
                        <h4 class="brand-title">${brand.title}</h4>
                    </div>
                </div>
            `;
            galleryGrid.appendChild(brandItem);
        });
    }

    // 添加品牌图片样式
    function addBrandStyles() {
        if (document.getElementById('brand-styles')) return;

        const style = document.createElement('style');
        style.id = 'brand-styles';
        style.textContent = `
            .brands-gallery {
                margin: 40px 0;
            }
            
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 30px;
                padding: 20px 0;
            }
            
            .brand-item {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                background: white;
            }
            
            .brand-item:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            }
            
            .brand-image-container {
                position: relative;
                width: 100%;
                height: 120px;
                overflow: hidden;
            }
            
            .brand-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .brand-item:hover .brand-image {
                transform: scale(1.05);
            }
            
            .brand-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                padding: 20px 15px 15px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            }
            
            .brand-item:hover .brand-overlay {
                transform: translateY(0);
            }
            
            .brand-title {
                color: white;
                margin: 0;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .gallery-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                }
                
                .brand-image-container {
                    height: 100px;
                }
                
                .brand-title {
                    font-size: 14px;
                }
            }
            
            @media (max-width: 480px) {
                .gallery-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
                
                .brand-image-container {
                    height: 80px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 添加品牌图片的函数（供外部调用）
    window.addBrandImage = function (imageSrc, imageAlt, imageTitle) {
        const newBrand = {
            src: imageSrc,
            alt: imageAlt || '合作品牌',
            title: imageTitle || '新品牌'
        };

        brandImages.push(newBrand);
        renderBrandImages();
        console.log('品牌图片已添加:', newBrand);
    };

    // 删除品牌图片的函数（供外部调用）
    window.removeBrandImage = function (index) {
        if (index >= 0 && index < brandImages.length) {
            const removedBrand = brandImages.splice(index, 1)[0];
            renderBrandImages();
            console.log('品牌图片已删除:', removedBrand);
        }
    };

    // 清空所有品牌图片的函数（供外部调用）
    window.clearAllBrandImages = function () {
        brandImages.length = 0;
        renderBrandImages();
        console.log('所有品牌图片已清空');
    };

    // 初始化
    addBrandStyles();
    renderBrandImages();

    console.log('品牌页面 JavaScript 已加载完成！');
    console.log('可用函数: addBrandImage(src, alt, title), removeBrandImage(index), clearAllBrandImages()');
});