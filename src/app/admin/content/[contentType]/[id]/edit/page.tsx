'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicForm from '@cms/components/forms/DynamicForm';

interface ContentTypeDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: any[];
}

interface ContentItem {
  id: string;
  contentType: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentType = params.contentType as string;
  const id = params.id as string;
  
  const [contentTypeDefinition, setContentTypeDefinition] = useState<ContentTypeDefinition | null>(null);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [contentType, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch content type definition
      const contentTypeResponse = await fetch(`/api/cms/content-types?name=${contentType}`);
      if (!contentTypeResponse.ok) {
        throw new Error('Content type not found');
      }
      const contentTypeData = await contentTypeResponse.json();
      setContentTypeDefinition(contentTypeData.contentType);

      // Fetch content item
      const contentResponse = await fetch(`/api/cms/content/${contentType}/${id}`);
      if (!contentResponse.ok) {
        throw new Error('Content not found');
      }
      const contentData = await contentResponse.json();
      setContentItem(contentData.item);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/cms/content/${contentType}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      // Redirect back to content list
      router.push(`/admin/content/${contentType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!contentTypeDefinition || !contentItem) {
    return (
      <div className="form-page">
        <div className="error">Content not found</div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <div>
          <h1>Edit {contentTypeDefinition.displayName}</h1>
          <p>Editing: {contentItem.data.title || `Item ${id}`}</p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>

      <DynamicForm
        contentType={contentTypeDefinition}
        initialData={contentItem.data}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
