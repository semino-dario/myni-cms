import { NextRequest, NextResponse } from 'next/server';
import { getContentType } from '@config/content-types';

interface RouteParams {
  params: {
    contentType: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = params;
    
    const contentTypeDefinition = getContentType(contentType);
    if (!contentTypeDefinition) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    // Mock data por ahora
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

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { contentType } = params;
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
