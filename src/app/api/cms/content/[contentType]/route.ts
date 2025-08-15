import { NextRequest, NextResponse } from 'next/server';
import { getContentType } from '@config/content-types';
import { defaultConfig } from '@config/cms.config';
import { createDatabaseAdapter } from '@config/database';

interface RouteParams {
  params: Promise<{
    contentType: string;
  }>;
}

// GET /api/cms/content/article
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = await params;
    const { searchParams } = new URL(request.url);
    
    console.log('🔍 GET request for contentType:', contentType);
    
    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      console.log('❌ Content type not found:', contentType);
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    const searchQuery = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'updatedAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const filters: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_') && value) {
        const filterField = key.replace('filter_', '');
        filters[filterField] = value;
      }
    }

    console.log('🔍 Search params:', { searchQuery, sortField, sortDirection, filters });

    const dbAdapter = createDatabaseAdapter(defaultConfig);

    let items: any[];
    
    if (searchQuery || Object.keys(filters).length > 0) {
      const sort: Record<string, any> = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;
      items = await dbAdapter.search(contentType, searchQuery, filters, sort);
    } else {
      const options = {
        limit,
        skip,
        sort: { [sortField]: sortDirection === 'desc' ? -1 : 1 }
      };
      items = await dbAdapter.findMany(contentType, {}, options);
    }

    console.log('✅ Found items:', items.length);
    return NextResponse.json({ 
      items,
      total: items.length,
      contentType: contentTypeDefinition,
      search: searchQuery,
      filters,
      sort: { field: sortField, direction: sortDirection }
    });
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// POST /api/cms/content/article
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = await params;
    console.log('📝 POST request for contentType:', contentType);
    
    const body = await request.json();
    console.log('📝 Request body:', body);

    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      console.log('❌ Content type not found:', contentType);
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    if (!body.data) {
      console.log('❌ No data provided');
      return NextResponse.json(
        { error: 'Content data is required' },
        { status: 400 }
      );
    }

    console.log('📝 Data to save:', body.data);

    // Validar campos requeridos
    const missingFields = contentTypeDefinition.fields
      .filter(field => field.required)
      .filter(field => !body.data[field.name] && body.data[field.name] !== false)
      .map(field => field.displayName);

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating in database...');
    
    // Crear en base de datos
    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const newContent = await dbAdapter.create(contentType, body.data);
    
    console.log('✅ Content created successfully:', newContent);

    return NextResponse.json({ 
      item: newContent,
      message: 'Content created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating content:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'A content item with this unique field already exists' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Validation error: ' + error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
