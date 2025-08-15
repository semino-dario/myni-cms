import { CMSConfig } from './cms.config';
import { MongoDBAdapter } from './database/mongodb';
import { PostgreSQLAdapter } from './database/postgresql';

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  create(collection: string, data: any): Promise<any>;
  findOne(collection: string, query: any): Promise<any>;
  findMany(collection: string, query?: any, options?: any): Promise<any[]>;
  updateOne(collection: string, query: any, data: any): Promise<any>;
  deleteOne(collection: string, query: any): Promise<boolean>;
  search(collection: string, searchQuery: string, filters?: any, sort?: any): Promise<any[]>;
}

export function createDatabaseAdapter(config: CMSConfig): DatabaseAdapter {
  if (config.database.type === 'mongodb') {
    return new MongoDBAdapter(config);
  } else {
    return new PostgreSQLAdapter(config);
  }
}

// Re-export adapters for direct use if needed
export { MongoDBAdapter, PostgreSQLAdapter };
