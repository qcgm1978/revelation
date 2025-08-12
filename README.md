# 启示路 (Revelation Road)

## 项目简介

启示路是一个基于 Electron 和 React 的跨平台应用，提供分类式内容浏览体验。用户可以通过学科分类或书页分类浏览术语，并获取相关解释。应用支持中英文切换、随机术语选择和背景音乐控制等功能。

## 功能特性

- 🖥️ 基于 Electron 的桌面平台支持（Windows、macOS、Linux）
- 📱 基于 Capacitor 的移动平台支持（Android、iOS）
- 📚 双模式内容分类（学科分类和书页分类）
- 🔍 术语搜索和页码筛选功能
- 🌐 中英文语言切换
- 🎲 随机术语选择功能
- 🎵 背景音乐播放控制（空格键暂停/播放）
- 📱 响应式设计，适配移动端浏览
- 💾 本地数据存储，无需网络连接

## 开发环境要求

- Node.js 18+ 
- npm 或 yarn
- Electron 32+
- Capacitor 6+
- Android Studio (用于 Android 构建)
- Xcode (用于 iOS 构建)
- React 19+
- TypeScript 5+

## 安装依赖

```bash
npm install
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

### 移动应用 (基于 Capacitor)

```bash
# 构建 Web 资源
npm run build

# 同步到 Capacitor
npx cap sync

# 构建 Android 应用
npx cap build android

# 构建 iOS 应用
npx cap build ios

# 打开 Android Studio
npx cap open android

# 打开 Xcode
npx cap open ios
```

## 发布到应用市场

### 移动应用市场发布

#### Android (Google Play Store)

1. 构建 Web 资源并同步到 Capacitor：
   ```bash
   npm run build && npx cap sync android
   ```

2. 打开 Android Studio：
   ```bash
   npx cap open android
   ```

3. 在 Android Studio 中生成签名的 APK 或 App Bundle

4. 上传到 Google Play Console

#### iOS (App Store)

1. 构建 Web 资源并同步到 Capacitor：
   ```bash
   npm run build && npx cap sync ios
   ```

2. 打开 Xcode：
   ```bash
   npx cap open ios
   ```

3. 在 Xcode 中配置签名并构建 IPA

4. 上传到 App Store Connect

### 桌面应用分发

- Windows: 使用 NSIS 安装程序
- macOS: 使用 DMG 镜像文件
- Linux: 使用 AppImage 格式

## 项目结构

```
revelation/
├── .gitignore
├── .vscode/
├── App.tsx                  # 应用主组件
├── DEPLOYMENT.md
├── README.md
├── android/                 # Android 构建相关文件
├── assets/                  # 静态资源
├── build-android.sh         # Android 构建脚本
├── capacitor.config.ts
├── components/              # React 组件
│   ├── ApiKeyManager.tsx
│   ├── AsciiArtDisplay.tsx
│   ├── ContentDisplay.tsx
│   ├── LanguageSelector.tsx
│   ├── LoadingSkeleton.tsx
│   ├── MultiSelectControl.tsx
│   └── SearchBar.tsx
├── electron-builder-android.json
├── index.css                # 全局样式
├── index.html               # 入口 HTML
├── index.tsx                # 入口文件
├── main.js                  # Electron 主进程
├── metadata-1.json
├── metadata.json
├── package.json
├── preload.js
├── public/                  # 公共资源
│   └── revelation.json      # 术语数据
├── services/                # 服务模块
│   ├── deepseekService.ts
│   └── geminiService.ts
├── tsconfig.json
├── vite-env.d.ts
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

## 贡献指南

欢迎贡献代码或提出建议！请先创建 issue 描述问题或功能需求，然后提交 pull request。

## 许可证

本项目采用 MIT 许可证。详情请见 LICENSE 文件。
