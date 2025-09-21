import React, { useState,useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string, context?: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  showRandomButton?: boolean;
  language: 'zh' | 'en';
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, language }) => {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState<string>('');

 
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      setContext(event.detail);
    };

    document.addEventListener('contentUpdated', handleContentUpdate);
    return () => {
      document.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), undefined,context);
      setQuery('');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'zh' ? '自由提问' : 'Ask anything'}
          className="search-input"
          aria-label={language === 'zh' ? '搜索主题' : 'Search for a topic'}
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default SearchBar;