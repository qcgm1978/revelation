// 应用程序配置文件

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
      const localUrl = '/chapterPage.json';
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

export const config = {
  // 数据文件路径
  dataFilePath: "buddha_data.json",
  // 章节页面配置 - 指向JSON文件
  chapterPage,
};

// 直接导出chapterPage以供其他模块使用
export { chapterPage };
