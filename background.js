// 引入必要的库，这里假设grok是一个全局可用的工具
// 请根据实际情况进行调整

// 定义YouTube API密钥，需要在Google Cloud Console中申请
const YOUTUBE_API_KEY = 'AIzaSyD4Qlwu1aFWd6huzKC5MtqmKFgGvg6Rn2M';
// 定义Google Gemini API配置
const GEMINI_API_KEY = 'AIzaSyAPJH_Dev5fTGFfU2R0htMltFo_rNhleDc';
// 更新API URL - 使用最新的Gemini 2.0 模型
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 添加消息监听器，接收来自popup的搜索请求
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'searchNews') {
        searchYouTubeNews(request.keyword, request.timeRange)
            .then(newsItems => {
                sendResponse({success: true, news: newsItems});
            })
            .catch(error => {
                console.error("Error processing request:", error);
                sendResponse({success: false, error: error.message});
            });
        return true; // 表示会异步发送响应
    }
});

// 主搜索函数，处理关键词和时间范围
async function searchYouTubeNews(keyword, timeRange) {
    try {
        // 获取原始YouTube数据
        const items = await fetchYouTubeData(keyword, timeRange);
        
        // 处理数据找出热门内容
        const processedItems = processData(items);
        
        // 格式化并翻译内容
        const formattedItems = await formatNewsItems(processedItems);
        
        return formattedItems;
    } catch (error) {
        console.error("Error in searchYouTubeNews:", error);
        throw error;
    }
}

// 获取过去指定时间的时间戳
function getTimeAgo(timeRange) {
    const now = new Date();
    if (timeRange === '1h') {
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    } else { // 默认24h
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
}

// 构建YouTube API请求的URL
function buildYouTubeUrl(keyword, timeRange) {
    const publishedAfter = getTimeAgo(timeRange);
    // 对关键词进行URL编码
    const encodedKeyword = encodeURIComponent(keyword);
    return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedKeyword}&type=video&publishedAfter=${publishedAfter}&maxResults=50&order=relevance&key=${YOUTUBE_API_KEY}`;
}

// 发送请求获取YouTube视频数据
async function fetchYouTubeData(keyword, timeRange) {
    const url = buildYouTubeUrl(keyword, timeRange);
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "YouTube API error");
        }
        
        return data.items || [];
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        throw error;
    }
}

// 使用统计处理视频标题和描述，筛选出讨论最多的20条新闻
function processData(items) {
    if (!items || items.length === 0) {
        return [];
    }
    
    // 这里可以添加更复杂的排序逻辑，例如基于点赞、评论数等
    // 这里使用简单算法，根据标题和描述的相关性排序
    const sortedItems = items.sort((a, b) => {
        // 由于YouTube API不直接提供评论数和点赞数，
        // 这里使用标题和描述的匹配程度和发布时间综合评分
        // 实际应用中可以使用更复杂的算法或调用额外API获取互动数据
        
        // 简单示例：按发布时间的新鲜度排序
        const dateA = new Date(a.snippet.publishedAt);
        const dateB = new Date(b.snippet.publishedAt);
        return dateB - dateA;
    });
    
    // 返回前20条结果
    return sortedItems.slice(0, 20);
}

// 使用AI生成视频内容摘要的函数
async function generateContentSummary(text, isBrief = false) {
    if (!text || text.trim().length < 5) return '内容过短，无法生成摘要';
    
    // 创建本地摘要生成函数作为备用
    const simpleLocalSummary = (text, maxLength) => {
        // 尝试提取关键句子
        let sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length === 0) {
            return `${text.substring(0, maxLength)}...`;
        }
        
        // 选择最长的2个句子作为摘要
        sentences.sort((a, b) => b.length - a.length);
        let summaryText = sentences.slice(0, 2).join('。 ');
        
        if (summaryText.length > maxLength) {
            summaryText = summaryText.substring(0, maxLength) + '...';
        }
        
        return isBrief ? 
            `【本地摘要】${summaryText}` : 
            `【内容摘要】${summaryText}`;
    };
    
    const promptType = isBrief 
        ? "以下是一个YouTube视频的标题。请用中文简要总结这个视频可能讨论的主要内容要点（50字以内）："
        : "以下是一个YouTube视频的描述。请用中文总结这个视频的主要内容要点（100字以内）：";
    
    try {
        // 如果没有配置Gemini API密钥或密钥为默认值，使用简单的替代方案
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            console.log('Using fallback summary generation (no API key)');
            return simpleLocalSummary(text, isBrief ? 50 : 100);
        }
        
        // 构建API请求 - 使用官方示例格式
        const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        console.log(`Calling Gemini API for ${isBrief ? 'brief' : 'full'} summary`);
        
        const requestBody = {
            contents: [
                {
                    parts: [{ text: `${promptType}${text}` }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
                topP: 0.95
            }
        };
        
        // 发送API请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        // 解析响应
        const result = await response.json();
        
        // 详细记录API响应，用于调试
        console.log('Gemini API response:', JSON.stringify(result).substring(0, 200) + '...');
        
        // 检查错误
        if (result.error) {
            console.error('Gemini API error:', result.error);
            // 当API调用失败时，使用本地摘要作为备用
            return simpleLocalSummary(text, isBrief ? 50 : 100);
        }
        
        // 解析结果 - 适配新版API响应格式
        if (result.candidates && 
            result.candidates.length > 0 && 
            result.candidates[0].content && 
            result.candidates[0].content.parts && 
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text.trim();
        } else {
            console.error('Gemini API summary generation failed:', result);
            // 使用本地摘要作为备用
            return simpleLocalSummary(text, isBrief ? 50 : 100);
        }
    } catch (error) {
        console.error('Error generating content summary with Gemini:', error);
        // 使用本地摘要作为备用
        return simpleLocalSummary(text, isBrief ? 50 : 100);
    }
}

// 批量生成内容摘要
async function batchGenerateSummaries(texts, isBrief = false) {
    if (!texts || texts.length === 0) return [];
    
    try {
        // 添加延迟函数
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        // 顺序处理请求并添加延迟，避免API限制
        const summaries = [];
        for (const text of texts) {
            try {
                const summary = await generateContentSummary(text, isBrief);
                summaries.push(summary);
                // 添加300ms延迟以避免API速率限制
                await delay(300);
            } catch (e) {
                console.error('Error in individual summary generation:', e);
                summaries.push(isBrief 
                    ? `[处理错误] ${text.substring(0, 30)}...` 
                    : `[处理错误] ${text.substring(0, 80)}...`);
                await delay(300);
            }
        }
        return summaries;
    } catch (error) {
        console.error('Error in batch summary generation:', error);
        return texts.map(text => isBrief 
            ? `[批处理错误] ${text.substring(0, 30)}...` 
            : `[批处理错误] ${text.substring(0, 80)}...`);
    }
}

// 整理新闻信息，包括内容摘要和原视频链接
async function formatNewsItems(items) {
    if (!items || items.length === 0) {
        return [];
    }
    
    // 准备所有需要生成摘要的文本
    const titles = [];
    const descriptions = [];
    
    items.forEach(item => {
        titles.push(item.snippet.title);
        descriptions.push(item.snippet.description);
    });
    
    // 批量生成标题和描述的摘要
    const titleSummaries = await batchGenerateSummaries(titles, true);
    const descriptionSummaries = await batchGenerateSummaries(descriptions, false);
    
    // 整合摘要结果
    return items.map((item, index) => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const link = `https://www.youtube.com/watch?v=${videoId}`;
        const titleSummary = titleSummaries[index] || '无法生成标题摘要';
        const contentSummary = descriptionSummaries[index] || '无法生成内容摘要';
        
        return {
            title,
            description,
            chineseTitle: titleSummary,
            chineseDescription: contentSummary,
            link
        };
    });
}    