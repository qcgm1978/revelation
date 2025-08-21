import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  showRandomButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onRandom, isLoading, showRandomButton = true }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery(''); // Clear the input field after search
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="search-input"
          aria-label="Search for a topic"
          disabled={isLoading}
        />
      </form>
      {(showRandomButton !== false) && (
        <button onClick={onRandom} className="random-button" disabled={isLoading}>
          Random
        </button>
      )}
    </div>
  );
};

export default SearchBar;