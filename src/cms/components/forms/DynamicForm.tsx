'use client';

import { useState } from 'react';
import { FieldDefinition } from '@cms/types/content-types';
import TextField from './fields/TextField';
import TextAreaField from './fields/TextAreaField';
import BooleanField from './fields/BooleanField';
import DateField from './fields/DateField';
import NumberField from './fields/NumberField';

interface ContentTypeDefinition {
  name: string;
  displayName: string;
  fields: FieldDefinition[];
}

interface DynamicFormProps {
  contentType: ContentTypeDefinition;
  initialData: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  loading?: boolean;
}

export default function DynamicForm({ 
  contentType, 
  initialData, 
  onSubmit, 
  loading = false 
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    contentType.fields.forEach(field => {
      const value = formData[field.name];

      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = `${field.displayName} is required`;
      }

      // String length validation
      if (value && typeof value === 'string' && field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          newErrors[field.name] = `${field.displayName} must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.name] = `${field.displayName} must be at most ${field.validation.maxLength} characters`;
        }
      }

      // Pattern validation
      if (value && typeof value === 'string' && field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          newErrors[field.name] = `${field.displayName} format is invalid`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const onChange = (value: any) => handleFieldChange(field.name, value);

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.displayName}
            value={value}
            onChange={onChange}
            error={error}
            required={field.required}
            placeholder={`Enter ${field.displayName.toLowerCase()}...`}
            type={field.type}
          />
        );

      case 'textarea':
      case 'richtext':
        return (
          <TextAreaField
            key={field.name}
            name={field.name}
            label={field.displayName}
            value={value}
            onChange={onChange}
            error={error}
            required={field.required}
            placeholder={`Enter ${field.displayName.toLowerCase()}...`}
            rows={field.type === 'richtext' ? 10 : 4}
          />
        );

      case 'number':
        return (
          <NumberField
            key={field.name}
            name={field.name}
            label={field.displayName}
            value={value}
            onChange={onChange}
            error={error}
            required={field.required}
            placeholder={`Enter ${field.displayName.toLowerCase()}...`}
          />
        );

      case 'boolean':
        return (
          <BooleanField
            key={field.name}
            name={field.name}
            label={field.displayName}
            value={value}
            onChange={onChange}
            error={error}
            required={field.required}
          />
        );

      case 'date':
      case 'datetime':
        return (
          <DateField
            key={field.name}
            name={field.name}
            label={field.displayName}
            value={value}
            onChange={onChange}
            error={error}
            required={field.required}
            includeTime={field.type === 'datetime'}
          />
        );

      default:
        return (
          <div key={field.name} className="form-field">
            <label>{field.displayName}</label>
            <div className="field-not-implemented">
              Field type "{field.type}" not implemented yet
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      <div className="form-fields">
        {contentType.fields.map(renderField)}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
