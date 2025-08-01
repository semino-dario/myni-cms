import { ContentTypeRegistry } from '@cms/types';

// Aquí el desarrollador registrará sus content-types personalizados
// Ejemplo:
// import { productContentType } from './definitions/product';
// import { testimonialContentType } from './definitions/testimonial';

export const userContentTypes: ContentTypeRegistry = {
  // product: productContentType,
  // testimonial: testimonialContentType,
};

// Esta función se llamará automáticamente al inicializar el CMS
export default userContentTypes;
