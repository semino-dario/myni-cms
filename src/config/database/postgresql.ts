import { Client } from 'pg';
import { CMSConfig } from '../cms.config';
import { DatabaseAdapter } from '../database';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private client: Client | null = null;

  constructor(private config: CMSConfig) {}

  async connect(): Promise<void> {
    if (this.client?.connected) return;

    try {
      this.client = new Client({ connectionString: this.config.database.url });
      await this.client.connect();
      
      // Create content table if it doesn't exist
      await this.createContentTable();
      
      console.log('✅ Connected to PostgreSQL');
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw new Error('Failed to connect to PostgreSQL');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.end();
      this.client = null;
      console.log('✅ Disconnected from PostgreSQL');
    } catch (error) {
      console.error('❌ PostgreSQL disconnect error:', error);
    }
  }

  private async createContentTable(): Promise<void> {
    if (!this.client) throw new Error('Not connected to database');

    const query = `
      CREATE TABLE IF NOT EXISTS cms_content (
        id SERIAL PRIMARY KEY,
        content_type VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_by VARCHAR(100)
      );
      
      CREATE INDEX IF NOT EXISTS idx_cms_content_type ON cms_content(content_type);
      CREATE INDEX IF NOT EXISTS idx_cms_content_data ON cms_content USING GIN(data);
      CREATE INDEX IF NOT EXISTS idx_cms_content_created_at ON cms_content(created_at);
    `;

    await this.client.query(query);
  }

  async create(collection: string, data: any): Promise<any> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      const query = `
        INSERT INTO cms_content (content_type, data, created_by)
        VALUES ($1, $2, $3)
        RETURNING id, content_type, data, created_at, updated_at, created_by
      `;
      
      const result = await this.client.query(query, [
        collection,
        JSON.stringify(data),
        'current-user' // TODO: Get from auth context
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        contentType: row.content_type,
        data: row.data,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
      };
    } catch (error) {
      console.error('PostgreSQL create error:', error);
      throw error;
    }
  }

  async findOne(collection: string, query: any): Promise<any> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      const sqlQuery = `
        SELECT id, content_type, data, created_at, updated_at, created_by, updated_by
        FROM cms_content 
        WHERE content_type = $1 AND id = $2
      `;
      
      const result = await this.client.query(sqlQuery, [collection, query.id]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        contentType: row.content_type,
        data: row.data,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
      };
    } catch (error) {
      console.error('PostgreSQL findOne error:', error);
      throw error;
    }
  }

  async findMany(collection: string, query: any = {}, options: any = {}): Promise<any[]> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      const { limit = 50, skip = 0 } = options;
      
      const sqlQuery = `
        SELECT id, content_type, data, created_at, updated_at, created_by, updated_by
        FROM cms_content 
        WHERE content_type = $1
        ORDER BY updated_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await this.client.query(sqlQuery, [collection, limit, skip]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        contentType: row.content_type,
        data: row.data,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
      }));
    } catch (error) {
      console.error('PostgreSQL findMany error:', error);
      throw error;
    }
  }

  async updateOne(collection: string, query: any, data: any): Promise<any> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      const sqlQuery = `
        UPDATE cms_content 
        SET data = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
        WHERE content_type = $3 AND id = $4
        RETURNING id, content_type, data, created_at, updated_at, created_by, updated_by
      `;
      
      const result = await this.client.query(sqlQuery, [
        JSON.stringify(data),
        'current-user', // TODO: Get from auth context
        collection,
        query.id
      ]);
      
      if (result.rows.length === 0) throw new Error('Document not found');
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        contentType: row.content_type,
        data: row.data,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
      };
    } catch (error) {
      console.error('PostgreSQL updateOne error:', error);
      throw error;
    }
  }

  async deleteOne(collection: string, query: any): Promise<boolean> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      const sqlQuery = `
        DELETE FROM cms_content 
        WHERE content_type = $1 AND id = $2
      `;
      
      const result = await this.client.query(sqlQuery, [collection, query.id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('PostgreSQL deleteOne error:', error);
      throw error;
    }
  }

  async search(collection: string, searchQuery: string, filters: any = {}, sort: any = {}): Promise<any[]> {
    await this.connect();
    if (!this.client) throw new Error('Not connected to database');

    try {
      let whereConditions = ['content_type = $1'];
      let params: any[] = [collection];
      let paramIndex = 2;

      // Add search conditions
      if (searchQuery) {
        whereConditions.push(`(
          data->>'title' ILIKE $${paramIndex} OR
          data->>'slug' ILIKE $${paramIndex} OR
          data->>'content' ILIKE $${paramIndex} OR
          data->>'excerpt' ILIKE $${paramIndex}
        )`);
        params.push(`%${searchQuery}%`);
        paramIndex++;
      }

      // Add filters
      Object.entries(filters).forEach(([field, value]) => {
        if (field === 'createdAfter') {
          whereConditions.push(`created_at >= $${paramIndex}`);
          params.push(value);
          paramIndex++;
        } else if (field === 'createdBefore') {
          whereConditions.push(`created_at <= $${paramIndex}`);
          params.push(value);
          paramIndex++;
        } else if (value !== '' && value !== null && value !== undefined) {
          whereConditions.push(`data->>'${field}' = $${paramIndex}`);
          params.push(value === 'true' ? 'true' : value === 'false' ? 'false' : value);
          paramIndex++;
        }
      });

      const sqlQuery = `
        SELECT id, content_type, data, created_at, updated_at, created_by, updated_by
        FROM cms_content 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 100
      `;
      
      const result = await this.client.query(sqlQuery, params);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        contentType: row.content_type,
        data: row.data,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
      }));
    } catch (error) {
      console.error('PostgreSQL search error:', error);
      throw error;
    }
  }
}
