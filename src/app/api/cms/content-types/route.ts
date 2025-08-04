import { NextRequest, NextResponse } from 'next/server';
import { getAllContentTypes, getContentType } from '@config/content-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (name) {
      const contentType = getContentType(name);
      if (!contentType) {
        return NextResponse.json(
          { error: 'Content type not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ contentType });
    }

    const contentTypes = getAllContentTypes();
    return NextResponse.json({ contentTypes });
  } catch (error) {
    console.error('Error fetching content types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
