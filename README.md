# 启示路 (Revelation Road)

## 项目简介

启示路是一个基于 Electron 和 React 的跨平台应用，提供分类式内容浏览体验。用户可以通过学科分类或书页分类浏览术语(无限深入)，并获取相关解释。应用支持中英文切换、随机术语选择和背景音乐控制等功能。《启示路》是歌手邓紫棋的爱情科幻小说，小说讲述了一个被称为"启示路"的神秘世界，其中包含了许多隐藏的知识和秘密。目录里的术语即书里面提到或蕴含的概念，包括科学、神学、心理学、编程、哲学、音乐、文学等。内容在不断完善中，如果你有什么想法，可以提交Issue。

### 无限深入

用户可以通过点击术语及解释中的链接来无限深入，查看更详细的解释和相关内容。

在线浏览：用户可以在[本项目网页](https://qcgm1978.github.io/revelation/)直接浏览内容，无需下载。（获取更好体验需填写DeepSeek API key）

Vercel 部署：用户可以在[Vercel](https://revelation-sigma.vercel.app/)在线浏览。

[安卓版下载](https://qcgm1978.github.io/revelation/download.html)

该项目基于[Infinite Wiki](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221J3Y2wXFzHKha4Qnb7UObSYAucBl1KPBO%22%5D,%22action%22:%22open%22,%22userId%22:%22103462436203651956396%22,%22resourceKeys%22:%7B%7D%7D&amp;usp=sharing)构建。

## 功能特性

- 🖥️ 基于 Electron 和 Capacitor 的跨平台支持（Windows、macOS、Linux、Android 和 iOS）
- 📚 双模式内容分类（学科分类和书页分类）
- 🔍 术语搜索和页码筛选功能
- 🌐 中英文语言切换
- 🎲 随机术语选择功能
- 🎵 背景音乐播放控制（空格键暂停/播放）
- 📱 响应式设计，适配移动端浏览
- 💾 本地数据存储，无需网络连接
- 🔗 术语内容链接跳转功能
- 📱 原生应用手势导航支持

## 开发环境要求

- Node.js 18+
- npm 或 yarn
- Electron 32+
- Capacitor 6+ (用于移动平台构建)
- React 19+
- TypeScript 5+

## 安装依赖

```bash
# 使用cnpm安装依赖
cnpm install
```

## 开发模式

```bash
# 启动开发服务器
npm run dev

# 启动 Electron 开发模式
npm run electron:dev
```

## 构建应用

### 桌面应用

```bash
# 构建所有平台
npm run electron:build

# 构建特定平台
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

### 移动应用 (使用 Capacitor)

```bash
# 添加 Capacitor 平台
npx cap add android
npx cap add ios

# 构建 Web 应用
npm run build

# 同步到移动平台并构建Android应用（不打开Android Studio）
sudo npm run capacitor:build:android:noopen

# 打开 Android Studio
npx cap open android

# 打开 Xcode
npx cap open ios
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

3. 在 Android Studio 中构建签名 APK 或 App Bundle

4. 上传到 Google Play Console

#### iOS (App Store)

1. 构建 Web 应用：
   ```bash
   npm run build
   ```

2. 同步到 iOS 平台：
   ```bash
   npx cap sync ios
   ```

3. 打开 Xcode：
   ```bash
   npx cap open ios
   ```

4. 在 Xcode 中配置签名并构建

5. 上传到 App Store Connect

### 桌面应用分发

- Windows: 使用 NSIS 安装程序
- macOS: 使用 DMG 镜像文件
- Linux: 使用 AppImage 格式

## 项目结构

```
revelation/
├── .github/                 # GitHub 工作流配置
│   └── workflows/
│       ├── build.yml        # Android 构建工作流
│       └── deploy-pages.yml # GitHub Pages 部署工作流
├── .gitignore               # Git 忽略配置
├── .vscode/                 # VS Code 配置
├── App.tsx                  # 应用主组件
├── DEPLOYMENT.md            # 部署文档
├── README.md                # 项目说明文档
├── android/                 # Android 构建相关文件
├── assets/                  # 应用图标等静态资源
│   ├── android/
│   ├── ios/
│   └── windows/
├── build-android.sh         # Android 构建脚本
├── capacitor.config.ts      # Capacitor 配置文件
├── components/              # React 组件
│   ├── ApiKeyManager.tsx    # API 密钥管理组件
│   ├── AsciiArtDisplay.tsx  # ASCII 艺术展示组件
│   ├── ContentDisplay.tsx   # 内容展示组件
│   ├── ContentGenerator.tsx # 内容生成组件
│   ├── Directory.tsx        # 目录组件
│   ├── DirectoryUtils.tsx   # 目录工具组件
│   ├── DocumentRenderer.tsx # 文档渲染组件
│   ├── Header.tsx           # 头部组件
│   ├── HtmlLoader.tsx       # HTML 加载组件
│   ├── LanguageSelector.tsx # 语言选择器
│   ├── LoadingSkeleton.tsx  # 加载骨架屏
│   └── SearchBar.tsx        # 搜索栏组件
├── electron-builder-android.json # Electron 构建配置
├── hooks/                   # React Hooks
│   ├── useBookManager.ts    # 书籍管理 Hook
│   └── usePageController.ts # 页面控制 Hook
├── index.css                # 全局样式
├── index.html               # 入口 HTML
├── index.tsx                # 应用入口文件
├── main.js                  # Electron 主进程
├── metadata-1.json
├── metadata.json
├── package.json             # 项目依赖配置
├── preload.js               # Electron 预加载脚本
├── public/                  # 公共资源
│   ├── chapter_page.json    # 章节页面数据
│   ├── download.html        # 下载页面
│   ├── revelation.json      # 术语数据
│   ├── timeline.js          # 时间线功能
│   ├── timelineData.json    # 时间线数据
│   └── visualization.html   # 可视化页面
├── services/                # 服务模块
│   ├── deepseekService.ts   # DeepSeek API 服务
│   ├── freeWikiService.ts   # 免费 Wiki 服务
│   ├── geminiService.ts     # Gemini API 服务
│   └── wikiService.ts       # Wiki 服务
├── tsconfig.json            # TypeScript 配置
├── types/                   # TypeScript 类型定义
│   ├── directory.ts
│   └── react.d.ts
├── utils/                   # 工具函数
│   ├── audioManager.ts      # 音频管理器
│   ├── fileFormatter.ts     # 文件格式化工具
│   ├── formatUploadedFile.ts # 上传文件格式化工具
│   └── gestureHandler.ts    # 手势处理器
├── vite-env.d.ts            # Vite 环境类型定义
└── vite.config.ts           # Vite 配置
```


## 使用说明

1. 启动应用后，可以通过顶部搜索栏搜索术语
2. 点击左侧分类菜单切换不同学科
3. 点击"按书页分类"按钮可以按页码浏览术语
4. 在书页分类模式下，可以输入页码进行筛选
5. 点击"随机"按钮获取随机术语
6. 按空格键可以控制背景音乐的播放和暂停
7. 点击语言切换按钮可以在中英文之间切换
8. 点击带链接图标的术语标题可以跳转到相关内容
9. 在移动应用中，支持从左向右滑动后退，从右向左滑动前进

## 贡献指南

欢迎贡献代码或提出建议！请先创建 issue 描述问题或功能需求，然后提交 pull request。

## 许可证

本项目采用 MIT 许可证。