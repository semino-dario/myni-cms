import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CMSConfig } from './cms.config';

export interface StorageAdapter {
  uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
  getFileUrl(key: string): Promise<string>;
  getSignedUploadUrl(key: string, contentType: string): Promise<string>;
}

export class S3StorageAdapter implements StorageAdapter {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor(private config: CMSConfig) {
    this.bucket = process.env.S3_BUCKET_NAME || '';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    console.log('🔧 S3 Configuration:', {
      bucket: this.bucket,
      region: this.region,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ AWS credentials not configured, using mock storage');
    }

    if (!this.bucket) {
      console.warn('⚠️ S3_BUCKET_NAME not configured, using mock storage');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret',
      },
    });
  }

  private isMockMode(): boolean {
    const isMock = !process.env.AWS_ACCESS_KEY_ID || 
           !process.env.AWS_SECRET_ACCESS_KEY || 
           !this.bucket ||
           this.bucket === 'test-bucket' ||
           this.bucket === '';
    
    if (isMock) {
      console.log('🔄 Using mock storage mode');
    } else {
      console.log('☁️ Using real S3 storage');
    }
    
    return isMock;
  }

  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    if (this.isMockMode()) {
      console.log('🔄 Mock S3 upload:', key, contentType, file.length, 'bytes');
      return `/uploads/mock/${key}`;
    }

    try {
      console.log('☁️ Uploading to S3:', {
        bucket: this.bucket,
        key: key,
        contentType: contentType,
        size: file.length
      });

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Quitamos ACL - el bucket debe tener política pública en su lugar
      });

      await this.s3Client.send(command);
      
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      console.log('✅ File uploaded to S3:', url);
      
      return url;
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (this.isMockMode()) {
      console.log('🔄 Mock S3 delete:', key);
      return true;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('✅ File deleted from S3:', key);
      return true;
    } catch (error) {
      console.error('❌ S3 delete error:', error);
      return false;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    if (this.isMockMode()) {
      return `/uploads/mock/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    if (this.isMockMode()) {
      console.log('🔄 Mock signed URL for:', key);
      return `/api/cms/media/upload?mock=true&key=${key}`;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        // Sin ACL aquí también
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      console.log('✅ Signed URL generated for:', key);
      return signedUrl;
    } catch (error) {
      console.error('❌ S3 signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function createStorageAdapter(config: CMSConfig): StorageAdapter {
  return new S3StorageAdapter(config);
}
