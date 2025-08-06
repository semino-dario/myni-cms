import { NextRequest, NextResponse } from 'next/server';
import { getContentType } from '@config/content-types';
import { defaultConfig } from '@config/cms.config';
import { createDatabaseAdapter } from '@config/database';

interface RouteParams {
  params: Promise<{
    contentType: string;
  }>;
}

// GET /api/cms/content/article - Obtener todos los contenidos de un tipo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = await params;
    
    // Verificar que el content-type existe
    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    // Por ahora retornamos datos mock, luego conectaremos con la base de datos
    const mockData = [
      {
        id: '1',
        contentType,
        data: {
          title: 'Sample Article',
          slug: 'sample-article',
          content: 'This is a sample article content...',
          published: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ 
      items: mockData,
      total: mockData.length,
      contentType: contentTypeDefinition 
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cms/content/article - Crear nuevo contenido
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = await params;
    const body = await request.json();

    // Verificar que el content-type existe
    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    // Validar los datos según el content-type
    if (!body.data) {
      return NextResponse.json(
        { error: 'Content data is required' },
        { status: 400 }
      );
    }

    // Crear el contenido (mock por ahora)
    const newContent = {
      id: `${Date.now()}`,
      contentType,
      data: body.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating content:', newContent);

    return NextResponse.json({ 
      item: newContent,
      message: 'Content created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
