'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentTypeBuilder from '@cms/components/admin/content-builder/ContentTypeBuilder';

export default function NewContentTypePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (contentTypeData: any) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('Saving content type:', contentTypeData);
      
      // For now, just log and redirect back
      // Later we'll implement actual saving to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('Content type created successfully! (Mock)');
      router.push('/admin/content-types');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content type');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="content-type-builder-page">
      <div className="page-header">
        <div>
          <h1>Create New Content Type</h1>
          <p>Define the structure and fields for your new content type</p>
        </div>
        <button onClick={handleCancel} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <ContentTypeBuilder
        onSave={handleSave}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  );
}
