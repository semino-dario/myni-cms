'use client';

import { useState, useRef } from 'react';

interface MediaFieldProps {
  name: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string[];
}

interface MediaItem {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
}

export default function MediaField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  multiple = false,
  accept = ['image/*']
}: MediaFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(uploadFile);
      const results = await Promise.all(uploadPromises);
      
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
        const newUrls = results.map(r => r.url);
        onChange([...currentValues, ...newUrls]);
      } else {
        onChange(results[0].url);
      }

    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadFile = async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/cms/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.media;
  };

  const removeFile = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(url => url !== urlToRemove));
    } else {
      onChange('');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getDisplayValue = (): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const displayUrls = getDisplayValue();

  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      <div className="media-field">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={uploading}
          className="media-upload-btn"
        >
          {uploading ? 'Uploading...' : `+ Upload ${multiple ? 'Files' : 'File'}`}
        </button>

        {uploadError && (
          <div className="upload-error">
            {uploadError}
          </div>
        )}

        {displayUrls.length > 0 && (
          <div className="media-preview">
            {displayUrls.map((url, index) => (
              <div key={index} className="media-item">
                <div className="media-preview-content">
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={url} alt="Preview" className="media-thumbnail" />
                  ) : (
                    <div className="file-icon">📁</div>
                  )}
                  <span className="media-name">
                    {url.split('/').pop() || 'Unknown file'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(url)}
                  className="media-remove"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
}
