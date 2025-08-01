import { ContentTypeDefinition, ContentTypeRegistry } from '@cms/types';
import { articleContentType } from './presets/article';

// Content-types predefinidos del CMS
const presetContentTypes: ContentTypeRegistry = {
  article: articleContentType,
};

// Content-types personalizados del usuario (se cargan dinámicamente)
let userContentTypes: ContentTypeRegistry = {};

// Función para registrar content-types del usuario
export function registerUserContentTypes(contentTypes: ContentTypeRegistry): void {
  userContentTypes = { ...contentTypes };
}

// Función para obtener todos los content-types registrados
export function getAllContentTypes(): ContentTypeRegistry {
  return {
    ...presetContentTypes,
    ...userContentTypes,
  };
}

// Función para obtener un content-type específico
export function getContentType(name: string): ContentTypeDefinition | undefined {
  const allContentTypes = getAllContentTypes();
  return allContentTypes[name];
}

// Función para obtener lista de nombres de content-types
export function getContentTypeNames(): string[] {
  return Object.keys(getAllContentTypes());
}

// Función para validar un content-type
export function validateContentType(contentType: ContentTypeDefinition): string[] {
  const errors: string[] = [];

  if (!contentType.name || typeof contentType.name !== 'string') {
    errors.push('Content type name is required and must be a string');
  }

  if (!contentType.displayName || typeof contentType.displayName !== 'string') {
    errors.push('Content type displayName is required and must be a string');
  }

  if (!contentType.fields || !Array.isArray(contentType.fields) || contentType.fields.length === 0) {
    errors.push('Content type must have at least one field');
  }

  // Validar campos únicos
  const fieldNames = contentType.fields?.map(field => field.name) || [];
  const duplicateFields = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
  if (duplicateFields.length > 0) {
    errors.push(`Duplicate field names found: ${duplicateFields.join(', ')}`);
  }

  return errors;
}

// Inicializar con content-types predefinidos
export const contentTypeRegistry = presetContentTypes;
