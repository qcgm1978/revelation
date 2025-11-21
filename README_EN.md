# Revelation Road

- [中文](README.md)

## Project Introduction

Revelation Road is a React-based cross-platform application that provides a categorized content browsing experience. Users can browse terms (with infinite depth) by subject classification or book page classification and obtain relevant explanations. The application supports Chinese-English switching, background music, text-to-speech and other features. "Revelation Road" is a science fiction romance novel by singer G.E.M. (邓紫棋), which tells the story of a mysterious world called "Revelation Road" containing many hidden knowledge and secrets. The terms in the directory are concepts mentioned or implied in the book, including science, theology, psychology, programming, philosophy, music, literature, etc. The content is constantly being improved; if you have any ideas, you can submit an Issue.

### Infinite Depth

Users can click on links in terms and explanations to delve infinitely deeper, viewing more detailed explanations and related content.

Online browsing: Users can browse content directly on [this project webpage](https://qcgm1978.github.io/revelation/) without downloading. Supports multiple language models:
- DeepSeek: API key required
- Gemini: API key required
- iFlytek: API key and API secret required

Vercel deployment: Users can browse online at [Vercel](http://revelation-git-webandroid-qcgm1978s-projects.vercel.app/).

[Android version download](https://qcgm1978.github.io/revelation/download.html)

This project is built based on [Infinite Wiki](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221J3Y2wXFzHKha4Qnb7UObSYAucBl1KPBO%22%5D,%22action%22:%22open%22,%22userId%22:%22103462436203651956396%22,%22resourceKeys%22:%7B%7D%7D&amp;usp=sharing).

## Features

- 🖥️ Capacitor-based cross-platform support (Android)
- 📚 Dual-mode content classification (subject classification and book page classification)
- 🔍 Term search and page filtering functions
- 📊 Novel timeline animation display
- 🌐 Chinese-English automatic language switching
- 🎵 Background music playback control (space bar to pause/play)
- 📱 Responsive design, adapting to mobile browsing
- 💾 Local data storage, no network connection required
- 🔗 Term content link jump function
- 📱 Native application gesture navigation support
- 🔊 Text-to-speech reading functionality
- 🎨 Custom themes and interface styles
- 📤 Content export and sharing functionality

## Development Environment Requirements

- Node.js 18+
- npm or yarn
- Capacitor 7.4.2+
- React 19.1.0+
- TypeScript 5.8.2+

## Install Dependencies

```bash
# Install dependencies using npm
npm install

# Sync service provider
npm run sync
```

## Development Mode

```bash
# Start the development server (default port 5173)
npm run dev
```

## Build the Application

### Web Application

```bash
# Build the Web application
npm run build

# Preview the build result
npm run preview
```

### Mobile Application (Using Capacitor)

```bash
# Add Capacitor platform
npx cap add android

# Build and sync to mobile platform
npm run capacitor:build:android:noopen

# Open Android Studio
npx cap open android

# Build Android application in CI environment
sudo npm run capacitor:build:android:ci
```

## Deploy the Application

```bash
# Deploy to GitHub Pages
npm run deploy:gh-pages

# Deploy to Vercel
npm run vercel
```

## Usage Instructions

1. After starting the application, you can search for terms through the top search bar
2. Click on the left classification menu to switch between different subjects
3. Click the "Classify by Book Pages" button to browse terms by page number
4. In book page classification mode, you can enter page numbers for filtering
5. Press the space bar to control the playback and pause of background music
6. Click the language switch button to toggle between Chinese and English interfaces
7. Click on the term title with a link icon to jump to Tomato Reading for online browsing
8. In mobile applications, support swiping from left to right to go back, and from right to left to go forward
9. Use the text-to-speech function to read the current content

## Contribution Guidelines

Contributions or suggestions are welcome! Please create an issue to describe the problem or feature request first, and then submit a pull request.

## License

This project is licensed under the MIT License.