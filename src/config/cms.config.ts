export interface CMSConfig {
  adminPath: string;
  uploadsPath: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  database: {
    type: 'mongodb' | 'postgresql';
    url: string;
  };
  storage: {
    provider: 'aws-s3';
    region: string;
    bucket: string;
  };
  auth: {
    jwtSecret: string;
    bcryptRounds: number;
  };
}

export const defaultConfig: CMSConfig = {
  adminPath: process.env.CMS_ADMIN_PATH || '/admin',
  uploadsPath: process.env.UPLOADS_PATH || '/uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  database: {
    type: (process.env.DATABASE_TYPE as 'mongodb' | 'postgresql') || 'mongodb',
    url: process.env.DATABASE_TYPE === 'postgresql' 
      ? process.env.POSTGRES_URL || ''
      : process.env.MONGODB_URI || '',
  },
  storage: {
    provider: 'aws-s3',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET_NAME || '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
};
