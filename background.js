// 引入必要的库，这里假设grok是一个全局可用的工具
// 请根据实际情况进行调整

// 定义YouTube API密钥，需要在Google Cloud Console中申请
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';

// 定义关键词列表，用于筛选特定行业的新闻
const keywords = ['web3', 'crypto'];

// 获取过去24小时和过去1小时的时间戳
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// 构建YouTube API请求的URL
function buildYouTubeUrl(timeRange) {
    const publishedAfter = timeRange === '24h' ? twentyFourHoursAgo.toISOString() : oneHourAgo.toISOString();
    const keywordString = keywords.join('|');
    return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keywordString}&type=video&publishedAfter=${publishedAfter}&key=${YOUTUBE_API_KEY}`;
}

// 发送请求获取YouTube视频数据
async function fetchYouTubeData(timeRange) {
    const url = buildYouTubeUrl(timeRange);
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        return [];
    }
}

// 使用grok处理视频标题和描述，筛选出讨论最多的20条新闻
function processData(items) {
    // 这里假设grok有一个函数可以处理文本并返回热度排序的结果
    // 实际使用时需要根据grok的具体功能进行调整
    const sortedItems = items.sort((a, b) => {
        // 这里简单假设标题中关键词出现次数越多热度越高
        const countKeywords = (text) => {
            let count = 0;
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                count += (text.match(regex) || []).length;
            });
            return count;
        };
        const countA = countKeywords(a.snippet.title + a.snippet.description);
        const countB = countKeywords(b.snippet.title + b.snippet.description);
        return countB - countA;
    });
    return sortedItems.slice(0, 20);
}

// 整理新闻信息，包括中英文标题和原推文链接
function formatNewsItems(items) {
    return items.map(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const link = `https://www.youtube.com/watch?v=${videoId}`;
        // 这里简单假设英文标题和描述就是原始的，中文需要手动翻译或使用翻译API
        const chineseTitle = '需要手动翻译或使用翻译API';
        const chineseDescription = '需要手动翻译或使用翻译API';
        return {
            title,
            description,
            chineseTitle,
            chineseDescription,
            link
        };
    });
}

// 主函数，获取数据并处理
async function main() {
    const items24h = await fetchYouTubeData('24h');
    const items1h = await fetchYouTubeData('1h');
    const processedItems24h = processData(items24h);
    const processedItems1h = processData(items1h);
    const formattedItems24h = formatNewsItems(processedItems24h);
    const formattedItems1h = formatNewsItems(processedItems1h);

    // 可以将结果存储到本地存储或发送到前端页面展示
    chrome.storage.local.set({
        news24h: formattedItems24h,
        news1h: formattedItems1h
    }, () => {
        console.log('News data stored successfully');
    });
}

// 定时执行主函数
setInterval(main, 60 * 60 * 1000); // 每小时执行一次    