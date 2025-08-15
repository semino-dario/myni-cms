'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SearchAndFilters from '@cms/components/admin/SearchAndFilters';

interface ContentItem {
  id: string;
  contentType: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ContentTypeDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: Array<{
    name: string;
    displayName: string;
    type: string;
    required?: boolean;
  }>;
}

export default function ContentManagePage() {
  const params = useParams();
  const contentType = params.contentType as string;
  
  const [items, setItems] = useState<ContentItem[]>([]);
  const [contentTypeDefinition, setContentTypeDefinition] = useState<ContentTypeDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchContent();
  }, [contentType, searchQuery, filters, sortField, sortDirection]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir URL con parámetros de búsqueda
      const searchParams = new URLSearchParams();
      
      if (searchQuery) searchParams.set('search', searchQuery);
      if (sortField) searchParams.set('sortField', sortField);
      if (sortDirection) searchParams.set('sortDirection', sortDirection);
      
      // Agregar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          searchParams.set(`filter_${key}`, value);
        }
      });

      const url = `/api/cms/content/${contentType}?${searchParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setItems(data.items || []);
      setContentTypeDefinition(data.contentType);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/content/${contentType}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Refresh the list
      fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="content-manage-page">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-manage-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!contentTypeDefinition) {
    return (
      <div className="content-manage-page">
        <div className="error">Content type not found</div>
      </div>
    );
  }

  return (
    <div className="content-manage-page">
      <div className="page-header">
        <div>
          <h1>{contentTypeDefinition.displayName}</h1>
          <p>{contentTypeDefinition.description}</p>
        </div>
        <a href={`/admin/content/${contentType}/new`} className="btn-primary">
          + New {contentTypeDefinition.displayName}
        </a>
      </div>

      <SearchAndFilters
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        contentType={contentTypeDefinition}
        searchQuery={searchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      <div className="content-stats">
        <div className="stat-item">
          <span className="stat-number">{items.length}</span>
          <span className="stat-label">Items Found</span>
        </div>
        {searchQuery && (
          <div className="search-info">
            Searching for: <strong>"{searchQuery}"</strong>
          </div>
        )}
      </div>

      <div className="content-table">
        {items.length === 0 ? (
          <div className="empty-state">
            {!searchQuery && Object.keys(filters).length === 0 ? (
              <>
                <h3>No content found</h3>
                <p>Create your first {contentTypeDefinition.displayName.toLowerCase()} to get started.</p>
                <a href={`/admin/content/${contentType}/new`} className="btn-primary">
                  + Create {contentTypeDefinition.displayName}
                </a>
              </>
            ) : (
              <>
                <h3>No matching results</h3>
                <p>Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                {contentTypeDefinition.fields
                  .filter(field => field.name !== 'title' && field.name !== 'content' && field.name !== 'slug')
                  .slice(0, 2)
                  .map(field => (
                    <th key={field.name}>{field.displayName}</th>
                  ))
                }
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.data.title || `Item ${item.id}`}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.data.slug || '-'}
                    </code>
                  </td>
                  {contentTypeDefinition.fields
                    .filter(field => field.name !== 'title' && field.name !== 'content' && field.name !== 'slug')
                    .slice(0, 2)
                    .map(field => (
                      <td key={field.name}>
                        {field.type === 'boolean' 
                          ? (item.data[field.name] ? 'Yes' : 'No')
                          : field.type === 'media' && item.data[field.name]
                          ? '📷'
                          : (item.data[field.name] || '-')
                        }
                      </td>
                    ))
                  }
                  <td>
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <a href={`/admin/content/${contentType}/${item.id}/edit`} className="btn-secondary">
                        Edit
                      </a>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
