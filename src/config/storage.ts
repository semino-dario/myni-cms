import { CMSConfig } from './cms.config';

export interface StorageAdapter {
  uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
  getFileUrl(key: string): Promise<string>;
  getSignedUploadUrl(key: string, contentType: string): Promise<string>;
}

export class S3StorageAdapter implements StorageAdapter {
  constructor(private config: CMSConfig) {}

  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    // AWS S3 upload implementation
    console.log('S3 upload:', key, contentType, file.length);
    return `https://${this.config.storage.bucket}.s3.${this.config.storage.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    // AWS S3 delete implementation
    console.log('S3 delete:', key);
    return true;
  }

  async getFileUrl(key: string): Promise<string> {
    // AWS S3 get URL implementation
    return `https://${this.config.storage.bucket}.s3.${this.config.storage.region}.amazonaws.com/${key}`;
  }

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    // AWS S3 signed URL implementation
    console.log('S3 signed URL:', key, contentType);
    return `https://${this.config.storage.bucket}.s3.${this.config.storage.region}.amazonaws.com/${key}?signed=true`;
  }
}

export function createStorageAdapter(config: CMSConfig): StorageAdapter {
  return new S3StorageAdapter(config);
}
