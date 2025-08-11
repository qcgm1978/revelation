#!/bin/bash

echo "构建 Android APK..."

# 检查是否安装了必要的工具
if ! command -v java &> /dev/null; then
    echo "错误：未找到 Java，请安装 JDK 8 或更高版本"
    exit 1
fi

if ! command -v android &> /dev/null; then
    echo "错误：未找到 Android SDK，请安装 Android Studio 或 Android SDK"
    exit 1
fi

# 构建应用
npm run build

# 构建 Android APK
npm run electron:build:android

echo "Android APK 构建完成！"
echo "输出文件位于：dist-electron/"