'use client';

import { useState } from 'react';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  contentType?: any;
  searchQuery?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function SearchAndFilters({
  onSearch,
  onFilter,
  onSort,
  contentType,
  searchQuery = '',
  sortField = 'updatedAt',
  sortDirection = 'desc'
}: SearchAndFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleFilterChange = (fieldName: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[fieldName];
    } else {
      newFilters[fieldName] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setLocalSearchQuery('');
    onFilter({});
    onSearch('');
  };

  const getSortableFields = () => {
    if (!contentType?.fields) return [];
    
    return contentType.fields.filter((field: any) => 
      ['text', 'number', 'date', 'datetime', 'boolean'].includes(field.type)
    );
  };

  const getBooleanFields = () => {
    if (!contentType?.fields) return [];
    return contentType.fields.filter((field: any) => field.type === 'boolean');
  };

  const getSelectFields = () => {
    if (!contentType?.fields) return [];
    return contentType.fields.filter((field: any) => field.type === 'select');
  };

  const handleSortChange = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="search-and-filters">
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>

        <div className="search-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>

          {(localSearchQuery || activeFilterCount > 0) && (
            <button onClick={clearAllFilters} className="clear-filters">
              Clear All
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Sort Options */}
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value)}
                className="filter-select"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created Date</option>
                {getSortableFields().map((field: any) => (
                  <option key={field.name} value={field.name}>
                    {field.displayName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onSort(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
                className="sort-direction"
                title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Boolean Filters */}
            {getBooleanFields().map((field: any) => (
              <div key={field.name} className="filter-group">
                <label>{field.displayName}:</label>
                <select
                  value={activeFilters[field.name] || ''}
                  onChange={(e) => handleFilterChange(field.name, e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            ))}

            {/* Select Filters */}
            {getSelectFields().map((field: any) => (
              <div key={field.name} className="filter-group">
                <label>{field.displayName}:</label>
                <select
                  value={activeFilters[field.name] || ''}
                  onChange={(e) => handleFilterChange(field.name, e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any</option>
                  {field.validation?.options?.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Date Range Filter */}
            <div className="filter-group">
              <label>Created after:</label>
              <input
                type="date"
                value={activeFilters.createdAfter || ''}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Created before:</label>
              <input
                type="date"
                value={activeFilters.createdBefore || ''}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
