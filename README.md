# Infinite Wiki - Electron 应用

## 项目简介

Infinite Wiki 是一个基于 Electron 的跨平台桌面应用，提供无限维基百科式的内容浏览体验。

## 功能特性

- �� 基于 Electron 的跨平台支持
- 📱 支持 Windows、macOS、Linux 和 Android
- 🔍 智能中文分词和内容搜索
- �� 美观的用户界面和交互体验
- �� 支持中英文混合内容

## 开发环境要求

- Node.js 18+ 
- npm 或 yarn
- Electron 32+
- Android SDK (用于 Android 构建)

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

### Android 应用

```bash
# 构建 Android APK
npm run electron:build:android

# 或使用脚本
./build-android.sh
```

## 发布到应用市场

### Android 应用市场

1. 构建 APK 文件：
   ```bash
   npm run electron:build:android
   ```

2. 签名 APK（如果需要）：
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore your-keystore.keystore app-release-unsigned.apk alias_name
   ```

3. 优化 APK：
   ```bash
   zipalign -v 4 app-release-unsigned.apk app-release.apk
   ```

4. 上传到 Google Play Store 或其他应用市场

### 桌面应用分发

- Windows: 使用 NSIS 安装程序
- macOS: 使用 DMG 镜像文件
- Linux: 使用 AppImage 格式

## 项目结构
