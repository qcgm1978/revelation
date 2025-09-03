#!/bin/bash

# 清理旧的图标文件
rm -rf /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-*/ic_launcher_foreground.png
rm -rf /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-*/ic_launcher_background.png
rm -rf /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-*/ic_launcher.png
rm -rf /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-*/ic_launcher_round.png

# 复制新的图标文件到各个mipmap目录
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_36x36.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-ldpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_36x36.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-ldpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_36x36.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-ldpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_36x36.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-ldpi/ic_launcher_round.png

cp /Users/dickphilipp/Documents/revelation/assets/android/icon_48x48.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_48x48.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-mdpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_48x48.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_48x48.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

cp /Users/dickphilipp/Documents/revelation/assets/android/icon_72x72.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_72x72.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-hdpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_72x72.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_72x72.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

cp /Users/dickphilipp/Documents/revelation/assets/android/icon_96x96.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_96x96.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xhdpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_96x96.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_96x96.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

cp /Users/dickphilipp/Documents/revelation/assets/android/icon_144x144.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_144x144.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_144x144.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_144x144.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

cp /Users/dickphilipp/Documents/revelation/assets/android/icon_192x192.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_192x192.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_192x192.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp /Users/dickphilipp/Documents/revelation/assets/android/icon_192x192.png /Users/dickphilipp/Documents/revelation/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# 同步Capacitor配置
npx cap sync android

# 构建Android应用
cd /Users/dickphilipp/Documents/revelation/android && ./gradlew assembleRelease