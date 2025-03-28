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