import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (name: string, surname?: string) => void;
  isSearching: boolean;
}

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search by name, ID, or registration number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 py-6 sm:py-7 text-base sm:text-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 focus-visible:ring-teal-500 dark:focus-visible:ring-teal-400 rounded-xl"
            disabled={isSearching}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mobile-ripple w-12 h-full rounded-r-xl"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isSearching || !query.trim()}
          className="mobile-ripple py-6 sm:py-7 px-6 sm:px-8 text-base sm:text-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 rounded-xl shadow-md active:shadow-sm transition-all duration-200 active:translate-y-0.5"
        >
          {isSearching ? (
            <>
              <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              <span>Search</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}