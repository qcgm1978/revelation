# Revelation Road

## Project Introduction

Revelation Road is a React-based cross-platform application that provides a categorized content browsing experience. Users can browse terms (with infinite depth) by subject classification or book page classification and obtain relevant explanations. The application supports Chinese-English switching, background music, and other features. "Revelation Road" is a science fiction romance novel by singer G.E.M. (邓紫棋), which tells the story of a mysterious world called "Revelation Road" containing many hidden knowledge and secrets. The terms in the directory are concepts mentioned or implied in the book, including science, theology, psychology, programming, philosophy, music, literature, etc. The content is constantly being improved; if you have any ideas, you can submit an Issue.

### Infinite Depth

Users can click on links in terms and explanations to delve infinitely deeper, viewing more detailed explanations and related content.

Online browsing: Users can browse content directly on [this project webpage](https://qcgm1978.github.io/revelation/) without downloading. (For a better experience, you need to fill in the DeepSeek or Gemini API key)

Vercel deployment: Users can browse online at [Vercel](https://revelation-sigma.vercel.app/).

[Android version download](https://qcgm1978.github.io/revelation/download.html)

This project is built based on [Infinite Wiki](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221J3Y2wXFzHKha4Qnb7UObSYAucBl1KPBO%22%5D,%22action%22:%22open%22,%22userId%22:%22103462436203651956396%22,%22resourceKeys%22:%7B%7D%7D&amp;usp=sharing).

## Features

- 🖥️ Capacitor-based cross-platform support (Android)
- 📚 Dual-mode content classification (subject classification and book page classification)
- 🔍 Term search and page filtering functions, novel timeline animation display
- 🌐 Chinese-English language switching
- 🎵 Background music playback control (space bar to pause/play)
- 📱 Responsive design, adapting to mobile browsing
- 💾 Local data storage, no network connection required
- 🔗 Term content link jump function
- 📱 Native application gesture navigation support

## Development Environment Requirements

- Node.js 18+
- npm or yarn
- Capacitor 6+ (for mobile platform building)
- React 19+
- TypeScript 5+

## Install Dependencies

```bash
# Install dependencies using npm
npm install
```

## Development Mode

```bash
# Start the development server
npm run dev
```

## Build the Application

### Mobile Application (Using Capacitor)

```bash
# Add Capacitor platform
npx cap add android

# Build the Web application
npm run build

# Sync to mobile platform and build Android application (without opening Android Studio)
sudo npm run capacitor:build:android:noopen

# Open Android Studio
npx cap open android
```

## Publish to App Market

### Mobile App Market Publishing

#### Android (Google Play Store)

1. Build the Web application:
   ```bash
   npm run build
   ```

2. Sync to Android platform and set permissions:

```bash
sudo npm run capacitor:build:android:noopen
```

## Project Structure

```
revelation/
├── .github/                 # GitHub workflow configuration
│   └── workflows/
│       ├── build.yml        # Android build workflow
│       └── deploy-pages.yml # GitHub Pages deployment workflow
├── .gitignore               # Git ignore configuration
├── .vscode/                 # VS Code configuration
├── App.tsx                  # Application main component
├── DEPLOYMENT.md            # Deployment documentation
├── README.md                # Project description document
├── android/                 # Android build related files
├── assets/                  # Static resources such as application icons
│   ├── android/
│   └── windows/
├── build-android.sh         # Android build script
├── capacitor.config.ts      # Capacitor configuration file
├── components/              # React components
│   ├── ApiKeyManager.tsx    # API key management component
│   ├── AsciiArtDisplay.tsx  # ASCII art display component
│   ├── ContentDisplay.tsx   # Content display component
│   ├── ContentGenerator.tsx # Content generation component
│   ├── Directory.tsx        # Directory component
│   ├── DirectoryUtils.tsx   # Directory utility component
│   ├── DocumentRenderer.tsx # Document rendering component
│   ├── Header.tsx           # Header component
│   ├── HtmlLoader.tsx       # HTML loading component
│   ├── LanguageSelector.tsx # Language selector
│   ├── LoadingSkeleton.tsx  # Loading skeleton screen
│   └── SearchBar.tsx        # Search bar component
├── electron-builder-android.json # Electron build configuration
├── hooks/                   # React Hooks
│   ├── useBookManager.ts    # Book management Hook
│   └── usePageController.ts # Page control Hook
├── index.css                # Global styles
├── index.html               # Entry HTML
├── index.tsx                # Application entry file
├── main.js                  # Electron main process
├── metadata-1.json
├── metadata.json
├── package.json             # Project dependency configuration
├── preload.js               # Electron preload script
├── public/                  # Public resources
│   ├── chapter_page.json    # Chapter page data
│   ├── download.html        # Download page
│   ├── revelation.json      # Term data
│   ├── timeline.js          # Timeline function
│   ├── timelineData.json    # Timeline data
│   └── visualization.html   # Visualization page
├── services/                # Service modules
│   ├── deepseekService.ts   # DeepSeek API service
│   ├── freeWikiService.ts   # Free Wiki service
│   ├── geminiService.ts     # Gemini API service
│   └── wikiService.ts       # Wiki service
├── tsconfig.json            # TypeScript configuration
├── types/                   # TypeScript type definitions
│   ├── directory.ts
│   └── react.d.ts
├── utils/                   # Utility functions
│   ├── audioManager.ts      # Audio manager
│   ├── fileFormatter.ts     # File formatting tool
│   ├── formatUploadedFile.ts # Uploaded file formatting tool
│   └── gestureHandler.ts    # Gesture handler
├── vite-env.d.ts            # Vite environment type definitions
└── vite.config.ts           # Vite configuration
```

## Usage Instructions

1. After starting the application, you can search for terms through the top search bar
2. Click on the left classification menu to switch between different subjects
3. Click the "Classify by Book Pages" button to browse terms by page number
4. In book page classification mode, you can enter page numbers for filtering
6. Press the space bar to control the playback and pause of background music
7. Click the language switch button to switch between Chinese and English
8. Click on the term title with a link icon to jump to Tomato Reading for online browsing
9. In mobile applications, support swiping from left to right to go back, and from right to left to go forward

## Contribution Guidelines

Contributions or suggestions are welcome! Please create an issue to describe the problem or feature request first, and then submit a pull request.

## License

This project is licensed under the MIT License.