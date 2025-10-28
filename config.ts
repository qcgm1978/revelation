// 应用程序配置文件

// 单一源图片配置 - 只需要修改这一个路径即可
export const SOURCE_IMAGE_PATH = "/buddha.jpg";

// 图标配置 - 基于单一源图片自动引用
export const appIcons = {
  // Android 图标配置
  android: {
    // 不同尺寸的图标路径 (会通过生成脚本自动生成)
    // icon_36x36: "/assets/android/icon_36x36.png",
    // icon_48x48: "/assets/android/icon_48x48.png",
    // icon_72x72: "/assets/android/icon_72x72.png",
    // icon_96x96: "/assets/android/icon_96x96.png",
    // icon_144x144: "/assets/android/icon_144x144.png",
    // icon_192x192: "/assets/android/icon_192x192.png",
    // icon_216x216: "/assets/android/icon_216x216.png",
    // icon_512x512: SOURCE_IMAGE_PATH,
    // 默认图标路径
    default: SOURCE_IMAGE_PATH
  },
  // Web 应用图标
  web: {
    favicon: "/assets/android/icon_36x36.png",
    appleTouchIcon: "/assets/android/icon_180x180.png"
  }
};

// 应用图片配置 - 基于单一源图片自动引用
export const appImages = {
  // 主应用图片
  logo: {
    // 主要应用logo
    main: SOURCE_IMAGE_PATH,
    // 方形logo
    square: SOURCE_IMAGE_PATH,
    // 小尺寸logo
    small: "/assets/android/icon_192x192.png"
  },
  // 二维码图片
  qrcode: "/assets/qrcode.jpeg",
  // 背景图片
  background: {
    // 主背景
    main: null,
    // 次要背景
    secondary: null
  },
  // 内容相关图片
  content: {
    // 默认封面图
    defaultCover: SOURCE_IMAGE_PATH,
    // 默认缩略图
    defaultThumbnail: "/assets/android/icon_192x192.png"
  }
};

// 图片自动生成配置 - 使用单一源图片路径
export const imageGenerationConfig = {
  // 源图片配置
  sourceImage: {
    // 主源图片路径 - 使用统一配置
    path: SOURCE_IMAGE_PATH,
    // 建议的源图片最小尺寸
    minSize: 512
  },
  // 生成配置
  generation: {
    // 是否启用自动生成
    enabled: true,
    // 生成的图片格式
    format: "png",
    // 输出目录
    outputDir: "/assets/android",
    // 需要生成的尺寸列表 (像素)
    sizes: [
      { width: 36, height: 36, suffix: "36x36" },
      { width: 48, height: 48, suffix: "48x48" },
      { width: 72, height: 72, suffix: "72x72" },
      { width: 96, height: 96, suffix: "96x96" },
      { width: 144, height: 144, suffix: "144x144" },
      { width: 180, height: 180, suffix: "180x180" },
      { width: 192, height: 192, suffix: "192x192" },
      { width: 216, height: 216, suffix: "216x216" },
      { width: 512, height: 512, suffix: "512x512" }
    ],
    // 图片质量 (0-1，仅对有损格式有效)
    quality: 1.0,
    // 是否保持纵横比
    preserveAspectRatio: true,
    // 背景色 (当调整大小时需要填充时使用)
    backgroundColor: "#FFFFFF",
    // 生成脚本路径
    scriptPath: "./scripts/generate_images.js"
  }
};

// 应用程序名称配置
export const appNames = {
  zh: "钱文忠说佛——开解人生困惑的觉悟指南",
  en: "Money Talks Buddhism - Awakening to Understanding",
};

// 版本信息配置
export const versionInfo = {
  zh: "",
  en: "",
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
  // 图标配置
  icons: appIcons,
  // 应用图片配置
  images: appImages,
  // 图片自动生成配置
  imageGeneration: imageGenerationConfig,
};

/**
 * 获取图片URL的辅助函数
 * @param imageType 图片类型 (logo, qrcode, background, content)
 * @param subType 图片子类型 (如果适用)
 * @param defaultUrl 默认URL，当指定图片不存在时使用
 * @returns 完整的图片URL
 */
export function getImageUrl(imageType: string, subType?: string, defaultUrl: string = SOURCE_IMAGE_PATH): string {
  try {
    // 检查类型是否存在
    if (!appImages[imageType]) {
      console.warn(`图片类型 ${imageType} 不存在`);
      return defaultUrl;
    }
    
    // 如果有子类型且图片类型是对象
    if (subType && typeof appImages[imageType] === 'object' && appImages[imageType] !== null) {
      const subImage = appImages[imageType][subType];
      if (subImage) {
        return subImage;
      } else {
        console.warn(`图片子类型 ${imageType}.${subType} 不存在`);
        return defaultUrl;
      }
    }
    
    // 直接返回图片URL
    const imageUrl = appImages[imageType];
    return imageUrl || defaultUrl;
  } catch (error) {
    console.error('获取图片URL时发生错误:', error);
    return defaultUrl;
  }
}

// 直接导出chapterPage以供其他模块使用
export { chapterPage };
