import { NextRequest, NextResponse } from 'next/server';
import { getContentType } from '@config/content-types';
import { defaultConfig } from '@config/cms.config';
import { createDatabaseAdapter } from '@config/database';

interface RouteParams {
  params: Promise<{
    contentType: string;
    id: string;
  }>;
}

// GET /api/cms/content/article/123 - Obtener contenido específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType, id } = await params;
    
    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const content = await dbAdapter.findOne(contentType, { id });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/content/article/123 - Actualizar contenido
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType, id } = await params;
    const body = await request.json();

    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    if (!body.data) {
      return NextResponse.json(
        { error: 'Content data is required' },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    const missingFields = contentTypeDefinition.fields
      .filter(field => field.required)
      .filter(field => !body.data[field.name] && body.data[field.name] !== false)
      .map(field => field.displayName);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const updatedContent = await dbAdapter.updateOne(contentType, { id }, body.data);

    return NextResponse.json({ 
      item: updatedContent,
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error updating content:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/content/article/123 - Eliminar contenido
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType, id } = await params;

    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const deleted = await dbAdapter.deleteOne(contentType, { id });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Content deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
