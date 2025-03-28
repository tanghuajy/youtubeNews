# YouTube热点搜索与AI摘要扩展

这是一个Chrome浏览器扩展，用于按关键词搜索YouTube上的热点内容，并使用Google Gemini 2.0 Flash AI自动生成内容要点摘要。

## 功能特点

- 支持自定义关键词搜索YouTube热点内容
- 可选择时间范围（过去1小时或24小时）
- 按热度排序，展示最热门的20条内容
- 使用Google Gemini 2.0 Flash AI自动生成视频内容摘要（中文）
- 内置本地摘要算法作为备用，确保始终能显示内容摘要
- 一键点击跳转到原始视频链接

## 技术实现

- 使用Chrome扩展API进行开发
- 调用YouTube Data API获取视频数据
- 使用Google Gemini 2.0 Flash API生成内容摘要
- 内置本地摘要算法作为备用方案
- 使用关键词匹配和排序算法筛选热门内容
- 使用Chrome的消息通信机制实现前后台交互

## 部署和安装步骤

### 1. 准备工作

1. 获取YouTube API密钥:
   - 访问[Google Cloud Console](https://console.cloud.google.com/)
   - 创建一个项目
   - 启用YouTube Data API v3
   - 在"凭据"页面创建API密钥
   - 复制生成的API密钥

2. 获取Google Gemini API密钥:
   - 访问[Google AI Studio](https://makersuite.google.com/app/apikey)
   - 注册/登录Google账户
   - 创建API密钥
   - 复制生成的API密钥

### 2. 配置扩展

1. 克隆或下载本仓库到本地
2. 打开`background.js`文件，配置API密钥:
   ```javascript
   const YOUTUBE_API_KEY = '你的YouTube API密钥';
   const GEMINI_API_KEY = '你的Gemini API密钥';
   ```

### 3. 安装扩展

1. 打开Chrome浏览器，在地址栏输入: `chrome://extensions/`
2. 在右上角开启"开发者模式"（打开开关）
3. 点击左上角的"加载已解压的扩展程序"按钮
4. 选择本仓库所在的文件夹
5. 扩展安装成功后，将在Chrome工具栏显示一个图标

### 4. 故障排除

如果遇到问题，请检查:
1. 是否正确替换了YouTube API密钥和Gemini API密钥
2. Chrome开发者控制台中是否有错误信息（右键点击扩展图标->检查）
3. API配额是否已用尽（YouTube和Gemini都有使用限额）

## 使用说明

1. 点击Chrome工具栏上的扩展图标，打开搜索界面
2. 在"关键词"输入框中输入你想搜索的内容（如"比特币"、"AI技术"等）
3. 从下拉菜单中选择时间范围（"过去1小时"或"过去24小时"）
4. 点击"搜索热点内容"按钮
5. 等待几秒钟，系统将查询相关视频并使用AI生成内容摘要
6. 每条结果包含:
   - 原始视频标题
   - AI生成的标题摘要
   - AI生成的内容要点摘要
   - "查看原视频"链接可直接跳转到YouTube视频

## 摘要生成系统

本扩展使用双重摘要生成系统:

1. **AI摘要生成** (优先级)
   - 使用Google Gemini 2.0 Flash API生成高质量摘要
   - 基于视频标题和描述智能提取内容要点
   - 以中文呈现核心内容，便于快速理解

2. **本地摘要备用系统** (备用方案)
   - 当AI API不可用或调用失败时自动启用
   - 使用基于句子长度的智能提取算法
   - 选择最具信息量的句子作为摘要
   - 确保用户始终能看到内容摘要，而不是错误信息

## Google Gemini 2.0 Flash优势

- 最新的Google AI大型语言模型
- 更快的响应速度，提供几乎实时的摘要
- 支持高质量中文摘要生成
- 更好地理解视频内容上下文
- 每月提供大量免费API调用额度

## 项目文件结构

- `manifest.json`: 扩展的配置文件
- `popup.html`: 弹出窗口的HTML结构，包含搜索表单
- `popup.js`: 弹出窗口的交互逻辑，处理搜索请求
- `background.js`: 后台服务，负责API调用、数据处理和AI摘要生成

## 隐私说明

- 本扩展不收集任何用户数据
- 所有搜索仅用于获取相关YouTube内容
- 视频标题和描述会发送到Google Gemini用于生成摘要
- 本地摘要功能不会发送任何数据到外部服务器

## 未来计划

- 添加更多排序选项（如按评论数、点赞数排序）
- 提供更详细的内容分析和关键点提取
- 添加保存搜索结果的功能
- 优化AI提示，生成更准确的内容摘要
- 支持更多语言的摘要生成 


AI:
https://aistudio.google.com/app/apikey

YOUTUBE:
https://console.cloud.google.com/apis/credentials?invt=AbtOMw&project=youtubenews-455106