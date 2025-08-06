'use client';

import { useState } from 'react';
import { FieldDefinition, FieldType } from '@cms/types/content-types';
import FieldBuilder from './FieldBuilder';

interface ContentTypeBuilderProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: any;
}

export default function ContentTypeBuilder({ 
  onSave, 
  onCancel, 
  loading = false,
  initialData 
}: ContentTypeBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fields, setFields] = useState<FieldDefinition[]>(initialData?.fields || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-z][a-z0-9]*$/i.test(name)) {
      newErrors.name = 'Name must start with a letter and contain only letters and numbers';
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    // Validate field names are unique
    const fieldNames = fields.map(f => f.name);
    const duplicateFields = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicateFields.length > 0) {
      newErrors.fields = `Duplicate field names: ${duplicateFields.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: name.toLowerCase(),
        displayName,
        description: description || undefined,
        fields,
        options: {
          timestamps: true,
          titleField: fields.find(f => f.name === 'title')?.name,
          slugField: fields.find(f => f.name === 'slug')?.name,
        }
      });
    }
  };

  const addField = () => {
    const newField: FieldDefinition = {
      name: `field${fields.length + 1}`,
      type: 'text',
      displayName: `Field ${fields.length + 1}`,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updatedField: FieldDefinition) => {
    const updatedFields = [...fields];
    updatedFields[index] = updatedField;
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updatedFields = [...fields];
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    setFields(updatedFields);
  };

  return (
    <form onSubmit={handleSubmit} className="content-type-builder">
      <div className="builder-section">
        <h2>Content Type Information</h2>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="name">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., product, testimonial, page"
              className={`field-input ${errors.name ? 'field-error' : ''}`}
            />
            {errors.name && <span className="field-error-message">{errors.name}</span>}
            <small>This will be used in URLs and code. Use lowercase letters and numbers only.</small>
          </div>

          <div className="form-field">
            <label htmlFor="displayName">
              Display Name <span className="required">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Product, Testimonial, Page"
              className={`field-input ${errors.displayName ? 'field-error' : ''}`}
            />
            {errors.displayName && <span className="field-error-message">{errors.displayName}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this content type is used for..."
            className="field-textarea"
            rows={3}
          />
        </div>
      </div>

      <div className="builder-section">
        <div className="section-header">
          <h2>Fields</h2>
          <button type="button" onClick={addField} className="btn-primary">
            + Add Field
          </button>
        </div>

        {errors.fields && <div className="error-message">{errors.fields}</div>}

        <div className="fields-list">
          {fields.length === 0 ? (
            <div className="empty-fields">
              <p>No fields added yet. Click "Add Field" to get started.</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <FieldBuilder
                key={index}
                field={field}
                index={index}
                onUpdate={(updatedField) => updateField(index, updatedField)}
                onRemove={() => removeField(index)}
                onMoveUp={index > 0 ? () => moveField(index, 'up') : undefined}
                onMoveDown={index < fields.length - 1 ? () => moveField(index, 'down') : undefined}
              />
            ))
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Content Type'}
        </button>
      </div>
    </form>
  );
}
