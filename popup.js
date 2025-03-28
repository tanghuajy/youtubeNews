// 从本地存储中获取新闻数据并展示
chrome.storage.local.get(['news24h', 'news1h'], (result) => {
    const news24h = result.news24h || [];
    const news1h = result.news1h || [];

    const newsList24h = document.getElementById('news-list-24h');
    const newsList1h = document.getElementById('news-list-1h');

    function createNewsItem(item) {
        const listItem = document.createElement('li');
        const title = document.createElement('h3');
        title.textContent = item.title;
        const chineseTitle = document.createElement('h3');
        chineseTitle.textContent = item.chineseTitle;
        const description = document.createElement('p');
        description.textContent = item.description;
        const chineseDescription = document.createElement('p');
        chineseDescription.textContent = item.chineseDescription;
        const link = document.createElement('a');
        link.href = item.link;
        link.textContent = '原推文链接';

        listItem.appendChild(title);
        listItem.appendChild(chineseTitle);
        listItem.appendChild(description);
        listItem.appendChild(chineseDescription);
        listItem.appendChild(link);
        return listItem;
    }

    news24h.forEach(item => {
        const listItem = createNewsItem(item);
        newsList24h.appendChild(listItem);
    });

    news1h.forEach(item => {
        const listItem = createNewsItem(item);
        newsList1h.appendChild(listItem);
    });
});

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const keywordInput = document.getElementById('keyword');
    const timeRangeSelect = document.getElementById('timeRange');
    const newsList = document.getElementById('news-list');
    const loadingElement = document.getElementById('loading');
    const resultsTitle = document.getElementById('results-title');

    // 点击搜索按钮时的事件处理
    searchBtn.addEventListener('click', function() {
        const keyword = keywordInput.value.trim();
        const timeRange = timeRangeSelect.value;
        
        // 验证关键词不能为空
        if (!keyword) {
            alert('请输入关键词');
            return;
        }

        // 显示加载中
        loadingElement.style.display = 'block';
        newsList.innerHTML = '';
        
        // 更新标题显示
        const timeText = timeRange === '1h' ? '过去1小时' : '过去24小时';
        resultsTitle.textContent = `${timeText}关于"${keyword}"的热点内容`;

        // 向后台脚本发送请求
        chrome.runtime.sendMessage({
            action: 'searchNews',
            keyword: keyword,
            timeRange: timeRange
        }, function(response) {
            // 隐藏加载提示
            loadingElement.style.display = 'none';
            
            if (response && response.success && response.news && response.news.length > 0) {
                // 显示搜索结果
                displayNewsItems(response.news);
            } else {
                // 显示无结果提示
                newsList.innerHTML = '<li>未找到相关热点内容，请尝试其他关键词</li>';
            }
        });
    });

    // 展示新闻项的函数
    function displayNewsItems(newsItems) {
        // 清空现有列表
        newsList.innerHTML = '';
        
        // 添加每条新闻
        newsItems.forEach(item => {
            const listItem = createNewsItem(item);
            newsList.appendChild(listItem);
        });
    }

    // 创建单个新闻项的HTML元素
    function createNewsItem(item) {
        const listItem = document.createElement('li');
        listItem.className = 'news-item';
        
        // 创建原始标题
        const title = document.createElement('h3');
        title.textContent = item.title;
        
        // 创建AI摘要标题
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = item.chineseTitle;
        summaryTitle.style.color = '#4285f4';
        
        // 创建分隔线
        const divider = document.createElement('div');
        divider.style.margin = '10px 0';
        divider.style.borderBottom = '1px dashed #eee';
        
        // 创建内容摘要标签
        const summaryLabel = document.createElement('p');
        summaryLabel.textContent = '内容要点摘要:';
        summaryLabel.style.fontWeight = 'bold';
        summaryLabel.style.marginTop = '10px';
        summaryLabel.style.marginBottom = '5px';
        
        // 创建AI内容摘要
        const contentSummary = document.createElement('p');
        contentSummary.textContent = item.chineseDescription;
        contentSummary.style.color = '#666';
        contentSummary.style.backgroundColor = '#f9f9f9';
        contentSummary.style.padding = '8px';
        contentSummary.style.borderRadius = '4px';
        
        // 创建链接
        const link = document.createElement('a');
        link.href = item.link;
        link.textContent = '查看原视频';
        link.target = '_blank';
        link.style.display = 'inline-block';
        link.style.marginTop = '10px';
        link.style.color = '#4285f4';
        
        // 添加元素到列表项
        listItem.appendChild(title);
        listItem.appendChild(summaryTitle);
        listItem.appendChild(divider);
        listItem.appendChild(summaryLabel);
        listItem.appendChild(contentSummary);
        listItem.appendChild(link);
        
        return listItem;
    }
});    