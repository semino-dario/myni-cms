export type FieldType = 
  | 'text'
  | 'textarea' 
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'media'
  | 'relation'
  | 'json'
  | 'email'
  | 'url'
  | 'select';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  accept?: string[];
  options?: string[];
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  displayName: string;
  required?: boolean;
  unique?: boolean;
  multiple?: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  relationTarget?: string; // For relation fields
  description?: string;
}

export interface ContentTypeOptions {
  timestamps?: boolean;
  slugField?: string;
  titleField?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentTypeDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: FieldDefinition[];
  options?: ContentTypeOptions;
}

export interface ContentItem {
  id: string;
  contentType: string;
  data: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ContentTypeRegistry {
  [key: string]: ContentTypeDefinition;
}
