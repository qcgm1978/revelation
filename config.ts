// 应用程序配置文件

// 应用程序名称配置
export const appNames = {
  zh: "钱文忠说佛——开解人生困惑的觉悟指南",
  en: "Money Talks Buddhism - Awakening to Understanding",
};

// 定义章节页面项目的接口
export interface ChapterPageItem {
  firstPassTime: string;
  isChapterLock: boolean;
  isPaidPublication: boolean;
  isPaidStory: boolean;
  itemId: string;
  needPay: number;
  realChapterOrder: string;
  title: string;
  volume_name: string;
}

// 定义章节页面数据类型
export type ChapterPageData = ChapterPageItem[];

// 初始化chapterPage为一个空数组
let chapterPage: ChapterPageData = [];

// 在浏览器环境中，尝试异步加载chapterPage.json
if (typeof window !== "undefined" && window.fetch) {
  // 异步加载函数（不会阻塞模块导出）
  const loadChapterPageData = async () => {
    try {
      // 首先尝试加载本地JSON文件
      const localUrl = "/chapterPage.json";
      const localResponse = await fetch(localUrl);
      if (!localResponse.ok) {
        throw new Error(`HTTP error! status: ${localResponse.status}`);
      }
      chapterPage = await localResponse.json();
      console.log("Chapter page data loaded successfully from local JSON");
      return chapterPage;
    } catch (error) {
      console.error("Failed to load chapter page data:", error);
    }
  };

  // 启动异步加载
  loadChapterPageData();
} else if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  // 在Node.js环境中，尝试同步加载文件
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), "public", "chapterPage.json");
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      chapterPage = JSON.parse(fileContent);
      console.log(
        "Chapter page data loaded successfully from JSON in Node.js environment"
      );
    }
  } catch (error) {
    console.error("Failed to load chapterPage.json in Node.js:", error);
  }
}

// 时间线数据配置
export const timelineConfig = {
  // 默认时间线类型
  // defaultType: 'novel',
  defaultType: "json",
  // 时间线数据源配置
  sources: {
    json: {
      name: {
        zh: '佛',
        en: 'Buddha'
      },
      jsonPath: "buddha_timeline.json",
      audioUrl: '王菲 - 金刚经_爱给网_aigei_com.mp3',
    },
    // novel: {
    //   name: {
    //     zh: '小说时间线',
    //     en: 'Novel Timeline'
    //   },
    //   audioUrl: 'https://p.scdn.co/mp3-preview/775fb3a76182997499309b0868a003528391da8e',
    //   // 可以配置为从本地JSON文件加载
    //   jsonPath: 'Yang.json'
    // },
    // gem: {
    //   name: {
    //     zh: '邓紫棋时间线',
    //     en: 'G.E.M. Timeline'
    //   },
    //   audioUrl: 'All About You-G.E.M.邓紫棋.mp3',
    //   // 使用gem-timeline-data包中的数据
    //   usePackageData: true
    // }
  },
  // 动画延迟时间（毫秒）
  animationDelay: 3000,
  // 音频默认音量
  audioVolume: 0.3,
};

export const config = {
  // 数据文件路径
  dataFilePath: "buddha_data.json",
  // 章节页面配置 - 指向JSON文件
  chapterPage,
  // 时间线配置
  timeline: timelineConfig,
};

// 直接导出chapterPage以供其他模块使用
export { chapterPage };
