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

export default function NewContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentType = params.contentType as string;
  
  const [contentTypeDefinition, setContentTypeDefinition] = useState<ContentTypeDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentType();
  }, [contentType]);

  const fetchContentType = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cms/content-types?name=${contentType}`);
      if (!response.ok) {
        throw new Error('Content type not found');
      }
      const data = await response.json();
      setContentTypeDefinition(data.contentType);
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

      const response = await fetch(`/api/cms/content/${contentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
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
        <div className="loading">Loading form...</div>
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

  if (!contentTypeDefinition) {
    return (
      <div className="form-page">
        <div className="error">Content type not found</div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <div>
          <h1>New {contentTypeDefinition.displayName}</h1>
          <p>Create a new {contentTypeDefinition.displayName.toLowerCase()}</p>
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
        initialData={{}}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
