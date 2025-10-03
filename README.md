# 启示路 (Revelation Road)

- [English](README_EN.md)

## 项目简介

启示路是一个基于React的跨平台应用，提供分类式内容浏览体验。用户可以通过学科分类或书页分类浏览术语(无限深入)，并获取相关解释。应用支持中英文切换、背景音乐等功能。《启示路》是歌手邓紫棋的爱情科幻小说，小说讲述了一个被称为"启示路"的神秘世界，其中包含了许多隐藏的知识和秘密。目录里的术语即书里面提到或蕴含的概念，包括科学、神学、心理学、编程、哲学、音乐、文学等。内容在不断完善中，如果你有什么想法，可以提交Issue。

### 无限深入

用户可以通过点击术语及解释中的链接来无限深入，查看更详细的解释和相关内容。

在线浏览：用户可以在[本项目网页](https://qcgm1978.github.io/revelation/)直接浏览内容，无需下载。支持多种语言模型：
- DeepSeek：需要配置API key
- Gemini：需要配置API key
- 讯飞：需要配置API key和API secret
- YouChat：直接可用，无需配置密钥

Vercel 部署：用户可以在[Vercel](http://revelation-git-webandroid-qcgm1978s-projects.vercel.app/)在线浏览。

[安卓版下载](https://qcgm1978.github.io/revelation/download.html)

该项目基于[Infinite Wiki](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221J3Y2wXFzHKha4Qnb7UObSYAucBl1KPBO%22%5D,%22action%22:%22open%22,%22userId%22:%22103462436203651956396%22,%22resourceKeys%22:%7B%7D%7D&amp;usp=sharing)构建。

## 功能特性

- 🖥️ 基于 Capacitor 的跨平台支持（Android）
- 📚 双模式内容分类（学科分类和书页分类）
- 🔍 术语搜索和页码筛选功能，小说时间线动画展示
- 🌐 中英文语言切换
- 🎵 背景音乐播放控制（空格键暂停/播放）
- 📱 响应式设计，适配移动端浏览
- 💾 本地数据存储，无需网络连接
- 🔗 术语内容链接跳转功能
- 📱 原生应用手势导航支持

## 开发环境要求

- Node.js 18+
- npm 或 yarn
- Capacitor 6+ (用于移动平台构建)
- React 19+
- TypeScript 5+

## 安装依赖

```bash
# 使用npm安装依赖
npm install
```

## 开发模式

```bash
# 启动开发服务器
npm run dev
```

## 构建应用

### 移动应用 (使用 Capacitor)

```bash
# 添加 Capacitor 平台
npx cap add android

# 构建 Web 应用
npm run build

# 同步到移动平台并构建Android应用（不打开Android Studio）
sudo npm run capacitor:build:android:noopen

# 打开 Android Studio
npx cap open android
```

## 发布到应用市场

### 移动应用市场发布

#### Android (Google Play Store)

1. 构建 Web 应用：
   ```bash
   npm run build
   ```

2. 同步到 Android 平台并设置权限：

```bash
sudo npm run capacitor:build:android:noopen
```

## 使用说明

1. 启动应用后，可以通过顶部搜索栏搜索术语
2. 点击左侧分类菜单切换不同学科
3. 点击"按书页分类"按钮可以按页码浏览术语
4. 在书页分类模式下，可以输入页码进行筛选
5. 按空格键可以控制背景音乐的播放和暂停
6. 点击语言切换按钮可以在中英文之间切换
7. 点击带链接图标的术语标题可以跳转到番茄读书在线浏览
8. 在移动应用中，支持从左向右滑动后退，从右向左滑动前进

## 贡献指南

欢迎贡献代码或提出建议！请先创建 issue 描述问题或功能需求，然后提交 pull request。

## 许可证

本项目采用 MIT 许可证。
