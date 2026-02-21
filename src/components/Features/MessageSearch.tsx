import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  type: string;
}

interface MessageSearchProps {
  onResultSelect: (messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onResultSelect }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadRecentSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_term')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSearches(data?.map(item => item.search_term) || []);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, type')
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setResults(data || []);

      // Save search to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('search_history')
          .insert({ 
            search_term: query,
            user_id: user.id
          });
      }

    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Search failed",
        description: "Failed to search messages",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.id);
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        Search Messages
      </Button>
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-10 pr-4"
            autoFocus
          />
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {(results.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching && (
            <div className="p-3 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left p-2 hover:bg-accent rounded text-sm"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Search Results
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-2 hover:bg-accent rounded"
                >
                  <div className="text-sm truncate">{result.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(result.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && !isSearching && (
            <div className="p-3 text-center text-muted-foreground">
              No messages found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;