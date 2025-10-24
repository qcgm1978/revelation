import { config } from '../config';

let cachedData: any = null;
let dataLoadingPromise: Promise<any> | null = null;


export const loadData = async (): Promise<any> => {
 
  if (cachedData) {
    return cachedData;
  }
  
 
  if (dataLoadingPromise) {
    return dataLoadingPromise;
  }
  
 

dataLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      const url = `${import.meta.env.BASE_URL || ''}${config.dataFilePath}`;
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
     
      setTimeout(() => {
        dataLoadingPromise = null;
      }, 0);
    }
  });
  
  return dataLoadingPromise;
};


export const clearDataCache = (): void => {
  cachedData = null;
};