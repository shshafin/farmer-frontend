import { useState, useEffect, useCallback } from 'react';
import searchIcon from '@/assets/icons/Search.svg';
import '@/assets/styles/Search.css';

function Search({ placeholder = 'Search...', onSearch, delay = 400 }) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    (value) => {
      const handler = setTimeout(() => onSearch?.(value), delay);
      return () => clearTimeout(handler);
    },
    [onSearch, delay]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  return (
    <div className='searchComponent'>
      <input
        type="search"
        name='search'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        autoComplete="off"
      />

      <div className="icon">
        <img src={searchIcon} alt="Search" />
      </div>
    </div>
  );
}

export default Search;