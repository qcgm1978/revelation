// @ts-ignore
import { useState, useEffect } from 'react';
import { DirectoryData } from '../types/directory';
import { formatFileContentFromString } from '../utils/fileProcessor';
import { loadData } from '../services/dataService';
import { appNames } from '../config';


const UPLOADED_BOOKS_KEY = 'revelation_uploaded_books';
const CURRENT_BOOK_KEY = 'revelation_current_book';
const IS_USING_UPLOADED_DATA_KEY = 'revelation_is_using_uploaded_data';

interface BookMetadata {
  id: string;
  title: string;
  timestamp: number;
}


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
 
  const [directoryData, setDirectoryData] = useState<DirectoryData>({});
  
 
  const [uploadedBooks, setUploadedBooks] = useState<Record<string, DirectoryData>>({});
  const [booksMetadata, setBooksMetadata] = useState<BookMetadata[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentBookTitle, setCurrentBookTitle] = useState<string>('');
  const [isUsingUploadedData, setIsUsingUploadedData] = useState<boolean>(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

 
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
        if (directoryData.title) {
          if (typeof directoryData.title === 'string') {
            setCurrentBookTitle(directoryData.title);
          }
        } else {
          setCurrentBookTitle(appNames[language]);
        }
      }
    } catch (error) {
      console.error('Error loading saved book data:', error);
    }
  }, [language, directoryData.title]);

 
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

 
  useEffect(() => {
    const loadDefaultDirectoryContent = async () => {
      try {
        const data = (await loadData()) as DirectoryData;
        setDirectoryData(data);
        if (data.title && !isUsingUploadedData) {
          if (typeof data.title === 'string') {
            setCurrentBookTitle(data.title);
          }
        }
      } catch (error) {
        console.error('Error loading revelation.json:', error);
        setDirectoryData({});
        if (!isUsingUploadedData) {
          setCurrentBookTitle(appNames[language]);
        }
      }
    };

    loadDefaultDirectoryContent();
  }, [isUsingUploadedData]);

 
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
         
          data = JSON.parse(content) as DirectoryData;
        } else if (fileExtension === 'txt') {
         
          try {
            const formattedContent = await formatFileContentFromString(content);

           
            data = Object.entries(formattedContent).reduce((acc, [category, terms]) => {
              acc[category] = terms.map(term => ({
                term: term.term,
                pages: term.pages,
               
              }));
              return acc;
            }, {} as DirectoryData);
            
            setCurrentBookTitle(file.name.replace('.txt', ''));
          } catch (formatError) {
            console.warn('格式化失败，使用备用方式处理TXT内容', formatError);

            const lines = content.split('\n');
            let processedContent: Record<string, Array<{ term: string; pages: string[] }>> = {};

            if (lines.length === 1 && lines[0].includes(',')) {
              const items = lines[0]
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item);
              processedContent = {
                主要内容: items.map((item) => ({ term: item, pages: [] }))
              };
            } else {
             
              processedContent = {
                未分类: lines
                  .filter((line) => line.trim())
                  .map((line) => ({ term: line.trim(), pages: [] }))
              };
            }

            data = Object.entries(processedContent).reduce((acc, [category, terms]) => {
              acc[category] = terms.map(term => ({
                term: term.term,
                pages: term.pages
              }));
              return acc;
            }, {} as DirectoryData);
            
            setCurrentBookTitle(file.name.replace('.txt', ''));
          }
        } else {
          throw new Error(language === 'zh' ? '不支持的文件格式' : 'Unsupported file format');
        }

       
        const bookId = Date.now().toString();

       
        const newUploadedBooks = { ...uploadedBooks, [bookId]: data };
        const newMetadata = [
          ...booksMetadata,
          {
            id: bookId,
            title: file.name.replace(/\.[^/.]+$/, ''),
            timestamp: Date.now()
          }
        ];

        setUploadedBooks(newUploadedBooks);
        setBooksMetadata(newMetadata);
        setCurrentBookId(bookId);
        setIsUsingUploadedData(true);
        setUploadErrorMessage(null);

       
        saveBooksToLocalStorage(newUploadedBooks, newMetadata);
      } catch (error) {
        console.error('文件上传处理错误:', error);
        setUploadErrorMessage(language === 'zh' ? `上传失败: ${error.message}` : `Upload failed: ${error.message}`);
      }
    };

    if (fileExtension === 'json' || fileExtension === 'txt') {
      reader.readAsText(file);
    } else {
      setUploadErrorMessage(language === 'zh' ? '仅支持JSON和TXT文件' : 'Only JSON and TXT files are supported');
    }
  };

 
  const switchToDefaultBook = () => {
    setIsUsingUploadedData(false);
    setCurrentBookId(null);
    localStorage.setItem(IS_USING_UPLOADED_DATA_KEY, 'false');
    localStorage.removeItem(CURRENT_BOOK_KEY);
  };

 
  const getCurrentDirectoryData = (): DirectoryData => {
    if (isUsingUploadedData && currentBookId && uploadedBooks[currentBookId]) {
      return uploadedBooks[currentBookId];
    }
    return directoryData;
  };

 
  const switchToUploadedBook = (bookId: string) => {
    if (uploadedBooks[bookId]) {
      setCurrentBookId(bookId);
      setIsUsingUploadedData(true);
     
      const bookMeta = booksMetadata.find(meta => meta.id === bookId);
      if (bookMeta) {
        setCurrentBookTitle(bookMeta.title);
      }
      localStorage.setItem(CURRENT_BOOK_KEY, bookId);
      localStorage.setItem(IS_USING_UPLOADED_DATA_KEY, 'true');
    }
  };

 
  const deleteUploadedBook = (bookId: string) => {
    if (uploadedBooks[bookId]) {
      const newUploadedBooks = { ...uploadedBooks };
      delete newUploadedBooks[bookId];

      const newMetadata = booksMetadata.filter(meta => meta.id !== bookId);

      setUploadedBooks(newUploadedBooks);
      setBooksMetadata(newMetadata);

     
      if (currentBookId === bookId) {
        switchToDefaultBook();
      }

     
      saveBooksToLocalStorage(newUploadedBooks, newMetadata);
    }
  };

  return {
    directoryData,
    uploadedBooks: isUsingUploadedData && currentBookId ? uploadedBooks[currentBookId] : null,
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

export default useBookManager