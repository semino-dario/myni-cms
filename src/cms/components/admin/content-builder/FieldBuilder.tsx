'use client';

import { useState } from 'react';
import { FieldDefinition, FieldType } from '@cms/types/content-types';

interface FieldBuilderProps {
  field: FieldDefinition;
  index: number;
  onUpdate: (field: FieldDefinition) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const FIELD_TYPES: Array<{ value: FieldType; label: string; description: string }> = [
  { value: 'text', label: 'Text', description: 'Short text input' },
  { value: 'textarea', label: 'Textarea', description: 'Multi-line text' },
  { value: 'richtext', label: 'Rich Text', description: 'WYSIWYG editor' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'boolean', label: 'Boolean', description: 'True/false checkbox' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'datetime', label: 'Date & Time', description: 'Date and time picker' },
  { value: 'email', label: 'Email', description: 'Email input with validation' },
  { value: 'url', label: 'URL', description: 'URL input with validation' },
  { value: 'media', label: 'Media', description: 'File/image upload' },
  { value: 'relation', label: 'Relation', description: 'Reference to other content' },
  { value: 'select', label: 'Select', description: 'Dropdown selection' },
  { value: 'json', label: 'JSON', description: 'JSON data input' },
];

export default function FieldBuilder({
  field,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}: FieldBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = (updates: Partial<FieldDefinition>) => {
    onUpdate({ ...field, ...updates });
  };

  const updateValidation = (validationUpdates: Partial<FieldDefinition['validation']>) => {
    onUpdate({
      ...field,
      validation: { ...field.validation, ...validationUpdates }
    });
  };

  const selectedFieldType = FIELD_TYPES.find(ft => ft.value === field.type);

  return (
    <div className="field-builder">
      <div className="field-header">
        <div className="field-info">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="field-toggle"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <div className="field-summary">
            <span className="field-name">{field.displayName || field.name}</span>
            <span className="field-type-badge">{selectedFieldType?.label}</span>
            {field.required && <span className="required-badge">Required</span>}
          </div>
        </div>
        
        <div className="field-actions">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="move-btn" title="Move up">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="move-btn" title="Move down">
              ↓
            </button>
          )}
          <button 
            type="button" 
            onClick={onRemove} 
            className="remove-btn"
            title="Remove field"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="field-content">
          <div className="field-row">
            <div className="form-field">
              <label>Field Name</label>
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateField({ name: e.target.value })}
                placeholder="fieldName"
                className="field-input"
              />
              <small>Used in code and database. Use camelCase.</small>
            </div>

            <div className="form-field">
              <label>Display Name</label>
              <input
                type="text"
                value={field.displayName}
                onChange={(e) => updateField({ displayName: e.target.value })}
                placeholder="Field Display Name"
                className="field-input"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="form-field">
              <label>Field Type</label>
              <select
                value={field.type}
                onChange={(e) => updateField({ type: e.target.value as FieldType })}
                className="field-input"
              >
                {FIELD_TYPES.map(fieldType => (
                  <option key={fieldType.value} value={fieldType.value}>
                    {fieldType.label} - {fieldType.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Description</label>
              <input
                type="text"
                value={field.description || ''}
                onChange={(e) => updateField({ description: e.target.value })}
                placeholder="Optional description"
                className="field-input"
              />
            </div>
          </div>

          <div className="field-options">
            <div className="checkbox-group">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => updateField({ required: e.target.checked })}
                />
                <span>Required</span>
              </label>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={field.unique || false}
                  onChange={(e) => updateField({ unique: e.target.checked })}
                />
                <span>Unique</span>
              </label>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={field.multiple || false}
                  onChange={(e) => updateField({ multiple: e.target.checked })}
                />
                <span>Multiple values</span>
              </label>
            </div>
          </div>

          {/* Validation options based on field type */}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'url') && (
            <div className="validation-section">
              <h4>Text Validation</h4>
              <div className="field-row">
                <div className="form-field">
                  <label>Min Length</label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => updateValidation({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="0"
                    className="field-input"
                    min="0"
                  />
                </div>
                <div className="form-field">
                  <label>Max Length</label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => updateValidation({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="255"
                    className="field-input"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {field.type === 'number' && (
            <div className="validation-section">
              <h4>Number Validation</h4>
              <div className="field-row">
                <div className="form-field">
                  <label>Minimum Value</label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateValidation({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                    className="field-input"
                  />
                </div>
                <div className="form-field">
                  <label>Maximum Value</label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateValidation({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="100"
                    className="field-input"
                  />
                </div>
              </div>
            </div>
          )}

          {field.type === 'select' && (
            <div className="validation-section">
              <h4>Select Options</h4>
              <div className="form-field">
                <label>Options (one per line)</label>
                <textarea
                  value={field.validation?.options?.join('\n') || ''}
                  onChange={(e) => updateValidation({ 
                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="field-textarea"
                  rows={4}
                />
              </div>
            </div>
          )}

          {field.type === 'relation' && (
            <div className="validation-section">
              <h4>Relation Settings</h4>
              <div className="form-field">
                <label>Target Content Type</label>
                <input
                  type="text"
                  value={field.relationTarget || ''}
                  onChange={(e) => updateField({ relationTarget: e.target.value })}
                  placeholder="article, product, category..."
                  className="field-input"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
