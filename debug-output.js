// 调试输出文件
// 在浏览器控制台打开这个文件查看完整的新闻数据

fetch('api/get-data.php?type=news')
    .then(response => response.json())
    .then(data => {
        console.log('API返回的数据：', data);
        console.log('新闻列表：', data.data.news);

        // 显示每个新闻的ID和标题
        if (data.data && data.data.news) {
            console.log('\n=== 新闻列表 ===');
            data.data.news.forEach((news, index) => {
                console.log(`${index + 1}. ID: ${news.id}, 标题: ${news.title}`);
            });
        }
    })
    .catch(error => {
        console.error('API调用失败：', error);
    });


