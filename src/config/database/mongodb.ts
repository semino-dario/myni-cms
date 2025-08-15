import mongoose from 'mongoose';
import { CMSConfig } from '../cms.config';
import { DatabaseAdapter } from '../database';

// MongoDB Schema para contenido dinámico
const createContentSchema = (contentType: string) => {
  const schema = new mongoose.Schema({
    contentType: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: String },
    updatedBy: { type: String },
  }, {
    timestamps: true,
    collection: `content_${contentType}`
  });

  return mongoose.models[`Content_${contentType}`] || mongoose.model(`Content_${contentType}`, schema);
};

export class MongoDBAdapter implements DatabaseAdapter {
  private isConnected = false;

  constructor(private config: CMSConfig) {}

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await mongoose.connect(this.config.database.url);
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnect error:', error);
    }
  }

  async create(collection: string, data: any): Promise<any> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      const document = new Model({
        contentType: collection,
        data,
        createdBy: 'current-user', // TODO: Get from auth context
      });
      
      const saved = await document.save();
      return {
        id: saved._id.toString(),
        contentType: saved.contentType,
        data: saved.data,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        createdBy: saved.createdBy,
      };
    } catch (error) {
      console.error('MongoDB create error:', error);
      throw error;
    }
  }

  async findOne(collection: string, query: any): Promise<any> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      const doc = await Model.findById(query.id || query._id);
      
      if (!doc) return null;
      
      return {
        id: doc._id.toString(),
        contentType: doc.contentType,
        data: doc.data,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdBy: doc.createdBy,
      };
    } catch (error) {
      console.error('MongoDB findOne error:', error);
      throw error;
    }
  }

  async findMany(collection: string, query: any = {}, options: any = {}): Promise<any[]> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      const { limit = 50, skip = 0, sort = { updatedAt: -1 } } = options;
      
      const docs = await Model.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip);
      
      return docs.map(doc => ({
        id: doc._id.toString(),
        contentType: doc.contentType,
        data: doc.data,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdBy: doc.createdBy,
      }));
    } catch (error) {
      console.error('MongoDB findMany error:', error);
      throw error;
    }
  }

  async updateOne(collection: string, query: any, data: any): Promise<any> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      const updated = await Model.findByIdAndUpdate(
        query.id || query._id,
        { 
          data, 
          updatedBy: 'current-user' // TODO: Get from auth context
        },
        { new: true }
      );
      
      if (!updated) throw new Error('Document not found');
      
      return {
        id: updated._id.toString(),
        contentType: updated.contentType,
        data: updated.data,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        createdBy: updated.createdBy,
        updatedBy: updated.updatedBy,
      };
    } catch (error) {
      console.error('MongoDB updateOne error:', error);
      throw error;
    }
  }

  async deleteOne(collection: string, query: any): Promise<boolean> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      const result = await Model.findByIdAndDelete(query.id || query._id);
      return !!result;
    } catch (error) {
      console.error('MongoDB deleteOne error:', error);
      throw error;
    }
  }

  async search(collection: string, searchQuery: string, filters: any = {}, sort: any = {}): Promise<any[]> {
    await this.connect();
    
    try {
      const Model = createContentSchema(collection);
      let query: any = {};

      // Build search query
      if (searchQuery) {
        query.$or = [
          { 'data.title': { $regex: searchQuery, $options: 'i' } },
          { 'data.slug': { $regex: searchQuery, $options: 'i' } },
          { 'data.content': { $regex: searchQuery, $options: 'i' } },
          { 'data.excerpt': { $regex: searchQuery, $options: 'i' } },
        ];
      }

      // Add filters
      Object.entries(filters).forEach(([field, value]) => {
        if (field === 'createdAfter') {
          query.createdAt = { ...query.createdAt, $gte: new Date(value as string) };
        } else if (field === 'createdBefore') {
          query.createdAt = { ...query.createdAt, $lte: new Date(value as string) };
        } else if (value !== '' && value !== null && value !== undefined) {
          query[`data.${field}`] = value === 'true' ? true : value === 'false' ? false : value;
        }
      });

      const docs = await Model.find(query).sort(sort).limit(100);
      
      return docs.map(doc => ({
        id: doc._id.toString(),
        contentType: doc.contentType,
        data: doc.data,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdBy: doc.createdBy,
      }));
    } catch (error) {
      console.error('MongoDB search error:', error);
      throw error;
    }
  }
}
