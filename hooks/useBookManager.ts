import { useState, useEffect } from 'react';
import { DirectoryData } from '../types/directory';
import { formatFileContentFromString } from '../utils/fileFormatter';

// 定义存储键名常量
const UPLOADED_BOOKS_KEY = 'revelation_uploaded_books'; // 改为存储所有上传的书籍
const CURRENT_BOOK_KEY = 'revelation_current_book'; // 当前选择的书籍ID
const IS_USING_UPLOADED_DATA_KEY = 'revelation_is_using_uploaded_data';

// 定义书籍元数据接口
interface BookMetadata {
  id: string;
  title: string;
  timestamp: number;
}

// 定义书籍存储结构
interface UploadedBooksStorage {
  books: Record<string, DirectoryData>;
  metadata: BookMetadata[];
}

interface BookManagerResult {
  directoryData: DirectoryData;
  uploadedBooks: DirectoryData | null;
  currentBookTitle: string;
  isUsingUploadedData: boolean;
  uploadErrorMessage: string | null;
  uploadedBooksMetadata: BookMetadata[];
  currentBookId: string | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  switchToDefaultBook: () => void;
  getCurrentDirectoryData: () => DirectoryData;
  switchToUploadedBook: (bookId: string) => void;
  deleteUploadedBook: (bookId: string) => void;
}

const useBookManager = (language: 'zh' | 'en'): BookManagerResult => {
  // 目录数据状态
  const [directoryData, setDirectoryData] = useState<DirectoryData>({});
  
  // 书籍上传相关状态
  const [uploadedBooks, setUploadedBooks] = useState<Record<string, DirectoryData>>({});
  const [booksMetadata, setBooksMetadata] = useState<BookMetadata[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentBookTitle, setCurrentBookTitle] = useState<string>(''); // 初始化为空，稍后从directoryData获取
  const [isUsingUploadedData, setIsUsingUploadedData] = useState<boolean>(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // 从localStorage加载保存的数据
  useEffect(() => {
    try {
      const savedBooksData = localStorage.getItem(UPLOADED_BOOKS_KEY);
      const savedIsUsing = localStorage.getItem(IS_USING_UPLOADED_DATA_KEY);
      const savedCurrentBook = localStorage.getItem(CURRENT_BOOK_KEY);
      
      if (savedBooksData) {
        const parsedData: UploadedBooksStorage = JSON.parse(savedBooksData);
        setUploadedBooks(parsedData.books || {});
        setBooksMetadata(parsedData.metadata || []);
      }
      
      let isUsingUploaded = false;
      if (savedIsUsing) {
        isUsingUploaded = savedIsUsing === 'true';
        setIsUsingUploadedData(isUsingUploaded);
      }
      
      if (savedCurrentBook) {
        setCurrentBookId(savedCurrentBook);
      }
      
      // 修复：确保根据isUsingUploadedData的状态正确设置currentBookTitle
      if (isUsingUploaded && savedCurrentBook) {
        const savedBooksData = localStorage.getItem(UPLOADED_BOOKS_KEY);
        if (savedBooksData) {
          const parsedData: UploadedBooksStorage = JSON.parse(savedBooksData);
          if (parsedData.metadata && savedCurrentBook) {
            const currentBookMeta = parsedData.metadata.find(meta => meta.id === savedCurrentBook);
            if (currentBookMeta) {
              setCurrentBookTitle(currentBookMeta.title);
            }
          }
        }
      } else {
        // 如果不使用上传数据，设置为默认书籍标题
        if (directoryData.title) {
          setCurrentBookTitle(directoryData.title);
        } else {
          setCurrentBookTitle(language === 'zh' ? '启示路' : 'Revelation');
        }
      }
    } catch (error) {
      console.error('Error loading saved book data:', error);
    }
  }, [language, directoryData.title]);

  // 保存书籍数据到localStorage
  const saveBooksToLocalStorage = (books: Record<string, DirectoryData>, metadata: BookMetadata[]) => {
    try {
      const dataToSave: UploadedBooksStorage = {
        books,
        metadata
      };
      localStorage.setItem(UPLOADED_BOOKS_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(IS_USING_UPLOADED_DATA_KEY, isUsingUploadedData.toString());
      if (currentBookId) {
        localStorage.setItem(CURRENT_BOOK_KEY, currentBookId);
      }
    } catch (storageError) {
      console.warn('Failed to save book data to localStorage:', storageError);
    }
  };

  // 加载默认目录内容
  useEffect(() => {
    const loadDefaultDirectoryContent = async () => {
      try {
        const url = `${import.meta.env.BASE_URL}extraction_results.json`;
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as DirectoryData;
        setDirectoryData(data);
        // 从directoryData获取默认书籍标题 - 只在不使用上传数据时设置
        if (data.title && !isUsingUploadedData) {
          setCurrentBookTitle(data.title);
        }
      } catch (error) {
        console.error('Error loading revelation.json:', error);
        setDirectoryData({});
        // 如果加载失败，使用备用标题 - 只在不使用上传数据时设置
        if (!isUsingUploadedData) {
          setCurrentBookTitle(language === 'zh' ? '启示路' : 'Revelation');
        }
      }
    };

    loadDefaultDirectoryContent();
  }, [language, isUsingUploadedData]);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let data: DirectoryData;

        if (fileExtension === 'json') {
          // 处理JSON文件
          data = JSON.parse(content) as DirectoryData;
        } else if (fileExtension === 'txt') {
          // 处理TXT文件 - 使用内存中字符串处理方式
          try {
            // 使用formatFileContentFromString直接处理字符串内容
            const formattedContent = await formatFileContentFromString(content);

            // 转换为DirectoryData结构
            data = {
              title: file.name.replace('.txt', ''),
              sections: Object.entries(formattedContent).map(
                ([category, terms], index) => ({
                  id: `section_${index}`,
                  title: category,
                  content: terms
                    .map(
                      (term) =>
                        `${term.term}${
                          term.pages.length ? ` (${term.pages.join(',')})` : ''
                        }`
                    )
                    .join('\n'),
                  subsections: []
                })
              )
            };
          } catch (formatError) {
            console.warn('格式化失败，使用备用方式处理TXT内容', formatError);

            // 备用处理方式：直接将TXT内容按行分割
            // 特别处理逗号分隔值
            const lines = content.split('\n');
            let processedContent: Record<
              string,
              Array<{ term: string; pages: string[] }>
            > = {};

            // 检查是否包含逗号分隔的值
            if (lines.length === 1 && lines[0].includes(',')) {
              // 处理逗号分隔的值（如"a,b,c,d,e"）
              const items = lines[0]
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item);
              processedContent = {
                主要内容: items.map((item) => ({ term: item, pages: [] }))
              };
            } else {
              // 处理普通文本行
              processedContent = {
                主要内容: lines
                  .map((line) => line.trim())
                  .filter((line) => line)
                  .map((line) => ({ term: line, pages: [] }))
              };
            }

            // 构建DirectoryData
            data = {
              title: file.name.replace('.txt', ''),
              sections: Object.entries(processedContent).map(
                ([category, terms], index) => ({
                  id: `section_${index}`,
                  title: category,
                  content: terms.map((term) => term.term).join('\n'),
                  subsections: []
                })
              )
            };
          }
        } else {
          throw new Error('不支持的文件类型，仅支持JSON和TXT');
        }

        // 生成唯一ID
        const bookId = `book_${Date.now()}`;
        const bookTitle = file.name.replace(/\.(json|txt)$/, '');
        
        // 更新书籍数据
        const updatedBooks = { ...uploadedBooks, [bookId]: data };
        const newMetadata: BookMetadata = { id: bookId, title: bookTitle, timestamp: Date.now() };
        const updatedMetadata = [...booksMetadata, newMetadata];
        
        setUploadedBooks(updatedBooks);
        setBooksMetadata(updatedMetadata);
        setCurrentBookId(bookId);
        setCurrentBookTitle(bookTitle);
        setIsUsingUploadedData(true);
        setUploadErrorMessage(null);

        // 将数据保存到localStorage实现持久化
        saveBooksToLocalStorage(updatedBooks, updatedMetadata);
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        setUploadErrorMessage(
          language === 'zh'
            ? '文件解析失败，请确保上传的是有效的JSON或TXT文件'
            : 'File parsing failed. Please ensure you upload a valid JSON or TXT file'
        );
      }
    };

    // 读取文件内容
    reader.readAsText(file);
  };

  // 切换回默认书籍
  const switchToDefaultBook = () => {
    setIsUsingUploadedData(false);
    // 从directoryData获取默认书籍标题
    if (directoryData.title) {
      setCurrentBookTitle(directoryData.title);
    } else {
      // 如果没有标题，使用备用标题
      setCurrentBookTitle(language === 'zh' ? '启示路' : 'Revelation');
    }
    setUploadErrorMessage(null);

    // 更新localStorage
    try {
      localStorage.setItem(IS_USING_UPLOADED_DATA_KEY, 'false');
    } catch (storageError) {
      console.warn('Failed to update localStorage:', storageError);
    }
  };

  // 切换到上传的书籍
  const switchToUploadedBook = (bookId: string) => {
    if (uploadedBooks[bookId]) {
      setCurrentBookId(bookId);
      const bookMeta = booksMetadata.find(meta => meta.id === bookId);
      if (bookMeta) {
        setCurrentBookTitle(bookMeta.title);
      }
      setIsUsingUploadedData(true);
      
      // 保存到localStorage
      try {
        localStorage.setItem(CURRENT_BOOK_KEY, bookId);
        localStorage.setItem(IS_USING_UPLOADED_DATA_KEY, 'true');
      } catch (storageError) {
        console.warn('Failed to update localStorage:', storageError);
      }
    }
  };

  // 删除上传的书籍
  const deleteUploadedBook = (bookId: string) => {
    const updatedBooks = { ...uploadedBooks };
    delete updatedBooks[bookId];
    
    const updatedMetadata = booksMetadata.filter(meta => meta.id !== bookId);
    
    setUploadedBooks(updatedBooks);
    setBooksMetadata(updatedMetadata);
    
    // 如果删除的是当前书籍，则切换到默认书籍
    if (currentBookId === bookId) {
      if (updatedMetadata.length > 0) {
        // 如果还有其他上传的书籍，切换到第一个
        const firstBookId = updatedMetadata[0].id;
        switchToUploadedBook(firstBookId);
      } else {
        // 否则切换到默认书籍
        switchToDefaultBook();
      }
    }
    
    // 更新localStorage
    saveBooksToLocalStorage(updatedBooks, updatedMetadata);
  };

  // 获取当前使用的目录数据并验证结构
  const getCurrentDirectoryData = (): DirectoryData => {
    try {
      let result: DirectoryData = {};
      
      if (isUsingUploadedData && currentBookId && uploadedBooks[currentBookId]) {
        result = uploadedBooks[currentBookId];
      } else {
        result = directoryData;
      }
      
      // 验证返回的数据结构是否符合DirectoryData
      if (!result || typeof result !== 'object') {
        console.warn('Invalid directory data structure, using empty object');
        return {};
      }
      
      // 验证每个分类下的数组是否符合DirectoryItem结构
      for (const category in result) {
        if (!Array.isArray(result[category])) {
          console.warn(`Invalid items for category '${category}', skipping`);
          delete result[category];
        } else {
          // 处理目录项，确保pages属性存在且是数组
          result[category] = result[category].map(item => {
            if (item && typeof item === 'object' && item.term) {
              return {
                ...item,
                pages: Array.isArray(item.pages) ? item.pages : []
              };
            }
            return null;
          }).filter(Boolean) as DirectoryItem[];
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting directory data:', error);
      return {};
    }
  };

  return {
    directoryData,
    uploadedBooks: currentBookId ? uploadedBooks[currentBookId] : null,
    currentBookTitle,
    isUsingUploadedData,
    uploadErrorMessage,
    uploadedBooksMetadata: booksMetadata,
    currentBookId,
    handleFileUpload,
    switchToDefaultBook,
    getCurrentDirectoryData,
    switchToUploadedBook,
    deleteUploadedBook
  };
};

export default useBookManager;