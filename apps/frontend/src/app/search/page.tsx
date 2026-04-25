'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Users, Building, Clock, TrendingUp, Hash } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api';
import { User } from '@/types/user';
import { Company } from '@/types/company';

interface SearchResults {
  users: User[];
  companies: Company[];
}

export default function SearchPage() {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResults>({
    users: [],
    companies: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'MLM',
    'Crypto',
    'Bitcoin',
    'Network Marketing',
  ]);

  // Debounce search
  useEffect(() => {
    if (query.trim().length <= 2) {
      setResults({ users: [], companies: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [usersResponse, companiesResponse] = await Promise.allSettled([
          apiClient.get('/users/search', { params: { q: query } }),
          apiClient.get('/companies', { params: { search: query } }),
        ]);

        const users = usersResponse.status === 'fulfilled' 
          ? usersResponse.value.data.data || [] 
          : [];
        const companies = companiesResponse.status === 'fulfilled' 
          ? companiesResponse.value.data.data || [] 
          : [];

        setResults({
          users: Array.isArray(users) ? users : [],
          companies: Array.isArray(companies) ? companies : [],
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults({ users: [], companies: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClearSearch = () => {
    setQuery('');
    setResults({ users: [], companies: [] });
  };

  const handleRecentSearchClick = (term: string) => {
    setQuery(term);
  };

  const handleRemoveRecentSearch = (index: number) => {
    setRecentSearches(prev => prev.filter((_, i) => i !== index));
  };

  const trendingTags = [
    { label: '#MLM', count: 42 },
    { label: '#Crypto', count: 38 },
    { label: '#Ecommerce', count: 25 },
    { label: '#Bitcoin', count: 19 },
    { label: '#NetworkMarketing', count: 15 },
    { label: '#DeFi', count: 12 },
  ];

  const hasResults = results.users.length > 0 || results.companies.length > 0;
  const showEmptyState = query.length > 2 && !isSearching && !hasResults;
  const showTrending = query.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Global Search & Discovery
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search across thousands of companies and users in the Oppora network
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-12">
          <div className="relative">
            <InputField
              type="text"
              value={query}
              onChange={setQuery}
              placeholder="Search companies, users, tags, or categories..."
              className="pl-14 pr-12 py-4 text-lg rounded-2xl shadow-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-6 w-6" />
            </div>
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          {isSearching && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Top Matches & Companies */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Matches Section */}
            {results.users.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Top Matches
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {results.users.length} users found
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.slice(0, 3).map((user) => (
                    <Card
                      key={user._id}
                      padding="md"
                      hoverEffect
                      className="cursor-pointer"
                      onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {results.users.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => {/* TODO: Show all users */}}
                    >
                      View all {results.users.length} users
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Companies Found Section */}
            {results.companies.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Companies Found
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {results.companies.length} companies found
                  </span>
                </div>
                <div className="space-y-4">
                  {results.companies.map((company) => (
                    <Card
                      key={company._id}
                      padding="md"
                      hoverEffect
                      className="cursor-pointer"
                      onClick={() => window.open(`/companies/${company.slug}`, '_blank')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                            {company.companyName?.[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {company.companyName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {company.category}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Trust Score: {company.scores?.trustScore || 'N/A'}
                              </span>
                            </div>
                            {company.description && (
                              <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                {company.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {company.scores?.overallRating?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {showEmptyState && (
              <Card padding="lg" className="text-center">
                <div className="max-w-md mx-auto py-8">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We couldn't find anything matching "{query}". Try different keywords or check spelling.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setQuery('')}
                  >
                    Clear search
                  </Button>
                </div>
              </Card>
            )}

            {/* Trending Tags (when no query) */}
            {showTrending && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Trending Categories
                  </h2>
                </div>
                <Card padding="md">
                  <div className="flex flex-wrap gap-3">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => handleRecentSearchClick(tag.label)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30 transition-all"
                      >
                        <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-purple-700 dark:text-purple-300">
                          {tag.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tag.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              </section>
            )}
          </div>

          {/* Right Column - Recent Searches & Info */}
          <div className="space-y-8">
            {/* Recent Searches */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Searches
                </h2>
              </div>
              <Card padding="md">
                {recentSearches.length > 0 ? (
                  <ul className="space-y-3">
                    {recentSearches.map((search, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      >
                        <button
                          onClick={() => handleRecentSearchClick(search)}
                          className="flex-1 text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {search}
                        </button>
                        <button
                          onClick={() => handleRemoveRecentSearch(index)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                          aria-label="Remove search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent searches
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setRecentSearches([])}
                    disabled={recentSearches.length === 0}
                  >
                    Clear All History
                  </Button>
                </div>
              </Card>
            </section>

            {/* Search Tips */}
            <Card padding="md">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                Search Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <span>Use at least 3 characters for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <span>Try company names, usernames, or category tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <span>Click on trending tags to quickly explore popular topics</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}