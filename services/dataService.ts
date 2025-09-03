let cachedData: any = null;
let dataLoadingPromise: Promise<any> | null = null;

// 共享的数据加载函数
export const loadData = async (): Promise<any> => {
  // 如果数据已缓存，直接返回
  if (cachedData) {
    return cachedData;
  }
  
  // 如果正在加载中，返回同一个Promise
  if (dataLoadingPromise) {
    return dataLoadingPromise;
  }
  
  // 开始加载数据
  dataLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      const url = `${import.meta.env.BASE_URL || ''}extraction_results_data.json`;
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      cachedData = data;
      resolve(data);
    } catch (error) {
      reject(error);
    } finally {
      // 在Promise解析后重置loading状态
      setTimeout(() => {
        dataLoadingPromise = null;
      }, 0);
    }
  });
  
  return dataLoadingPromise;
};

// 清除缓存（如果需要）
export const clearDataCache = (): void => {
  cachedData = null;
};