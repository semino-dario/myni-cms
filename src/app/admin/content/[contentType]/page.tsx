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
  
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
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
  }, [contentType]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allItems, searchQuery, filters, sortField, sortDirection]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cms/content/${contentType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      
      // Generate more mock data for testing search/filters
      const mockItems = generateMockData(data.contentType);
      
      setAllItems(mockItems);
      setContentTypeDefinition(data.contentType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (contentTypeDef: ContentTypeDefinition): ContentItem[] => {
    const mockItems: ContentItem[] = [];
    
    for (let i = 1; i <= 15; i++) {
      const randomDate = new Date(Date.now() - Math.random() * 86400000 * 30);
      mockItems.push({
        id: i.toString(),
        contentType,
        data: {
          title: `${contentTypeDef.displayName} ${i}`,
          slug: `${contentType}-${i}`,
          excerpt: `This is an excerpt for ${contentType} ${i}. Content number ${i}.`,
          content: `Full content for ${contentType} ${i}. This is sample content with keywords and descriptions.`,
          published: Math.random() > 0.5,
          publishedAt: randomDate.toISOString(),
          tags: ['sample', 'demo', i % 2 === 0 ? 'even' : 'odd', `tag-${i}`],
          featuredImage: i % 3 === 0 ? `/images/sample-${i}.jpg` : null,
        },
        createdAt: randomDate.toISOString(),
        updatedAt: new Date(randomDate.getTime() + Math.random() * 86400000).toISOString(),
      });
    }
    
    return mockItems;
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...allItems];

    // Apply search - MEJORADO para buscar en más campos
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filtered = filtered.filter(item => {
        // Buscar en todos los campos de texto del item
        const searchableFields = [];
        
        // Agregar campos específicos que sabemos que existen
        if (item.data.title) searchableFields.push(item.data.title);
        if (item.data.slug) searchableFields.push(item.data.slug);
        if (item.data.excerpt) searchableFields.push(item.data.excerpt);
        if (item.data.content) searchableFields.push(item.data.content);
        
        // Agregar tags si es un array
        if (Array.isArray(item.data.tags)) {
          searchableFields.push(...item.data.tags);
        }
        
        // Agregar el ID del item también
        searchableFields.push(item.id);
        
        // Buscar en todos los campos string/number del content-type
        contentTypeDefinition?.fields.forEach(field => {
          const value = item.data[field.name];
          if (value && (typeof value === 'string' || typeof value === 'number')) {
            searchableFields.push(value.toString());
          }
        });
        
        // Unir todo el texto y buscar
        const searchableText = searchableFields.join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (field === 'createdAfter' && value) {
        filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(value));
      } else if (field === 'createdBefore' && value) {
        filtered = filtered.filter(item => new Date(item.createdAt) <= new Date(value));
      } else if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = item.data[field];
          if (typeof itemValue === 'boolean') {
            return itemValue.toString() === value;
          }
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
      } else {
        aValue = a.data[sortField];
        bValue = b.data[sortField];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredItems(filtered);
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

      // Remove from local state
      setAllItems(prev => prev.filter(item => item.id !== id));
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
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onSort={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
        }}
        contentType={contentTypeDefinition}
        searchQuery={searchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      <div className="content-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredItems.length}</span>
          <span className="stat-label">
            {filteredItems.length === allItems.length ? 'Total Items' : `of ${allItems.length} items`}
          </span>
        </div>
        {searchQuery && (
          <div className="search-info">
            Searching for: <strong>"{searchQuery}"</strong>
            <small style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
              (searches in title, slug, content, tags, and ID)
            </small>
          </div>
        )}
      </div>

      <div className="content-table">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {allItems.length === 0 ? (
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
                <p>Try adjusting your search or filters. Searched in: title, slug, content, tags, and ID.</p>
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
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.data.title || `Item ${item.id}`}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.data.slug}
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
