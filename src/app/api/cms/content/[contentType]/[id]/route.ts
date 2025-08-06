import { NextRequest, NextResponse } from 'next/server';
import { getContentType } from '@config/content-types';

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

    // Mock data por ahora - simulamos contenido diferente según el ID
    const mockContent = {
      id,
      contentType,
      data: {
        title: id === '1' ? 'Sample Article' : `Another Article ${id}`,
        slug: id === '1' ? 'sample-article' : `article-${id}`,
        excerpt: `This is an excerpt for article ${id}`,
        content: `This is the full content for ${contentType} with ID ${id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        published: id === '1' ? true : false,
        publishedAt: new Date().toISOString(),
        tags: ['sample', 'cms', 'nextjs'],
        featuredImage: null,
      },
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ item: mockContent });
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

    // Mock update
    const updatedContent = {
      id,
      contentType,
      data: body.data,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Updating content:', updatedContent);

    return NextResponse.json({ 
      item: updatedContent,
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error updating content:', error);
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

    console.log('Deleting content:', { contentType, id });

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
