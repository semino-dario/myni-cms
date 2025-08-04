'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

  useEffect(() => {
    fetchContent();
  }, [contentType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cms/content/${contentType}`);
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

      <div className="content-stats">
        <div className="stat-item">
          <span className="stat-number">{items.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
      </div>

      <div className="content-table">
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No content found</h3>
            <p>Create your first {contentTypeDefinition.displayName.toLowerCase()} to get started.</p>
            <a href={`/admin/content/${contentType}/new`} className="btn-primary">
              + Create {contentTypeDefinition.displayName}
            </a>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                {contentTypeDefinition.fields
                  .filter(field => field.name !== 'title' && field.name !== 'content')
                  .slice(0, 3)
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
                  {contentTypeDefinition.fields
                    .filter(field => field.name !== 'title' && field.name !== 'content')
                    .slice(0, 3)
                    .map(field => (
                      <td key={field.name}>
                        {field.type === 'boolean' 
                          ? (item.data[field.name] ? 'Yes' : 'No')
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
