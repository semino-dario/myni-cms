import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig } from '@config/cms.config';
import { createStorageAdapter } from '@config/storage';
import { createDatabaseAdapter } from '@config/database';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Media upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size
    if (file.size > defaultConfig.maxFileSize) {
      console.log('❌ File too large:', file.size, 'vs', defaultConfig.maxFileSize);
      return NextResponse.json(
        { error: `File size exceeds limit of ${defaultConfig.maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!defaultConfig.allowedFileTypes.includes(file.type)) {
      console.log('❌ File type not allowed:', file.type);
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed types: ${defaultConfig.allowedFileTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${extension}`;
    const key = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${filename}`;

    console.log('📁 Generated key:', key);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const storageAdapter = createStorageAdapter(defaultConfig);
    const url = await storageAdapter.uploadFile(buffer, key, file.type);

    // Save media info to database
    const mediaItem = {
      id: `media_${timestamp}`,
      originalName: file.name,
      filename: key,
      url: url,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user', // TODO: Get from auth context
    };

    console.log('📁 Media item created:', mediaItem);

    // Optionally save to database for media management
    try {
      const dbAdapter = createDatabaseAdapter(defaultConfig);
      await dbAdapter.create('media', mediaItem);
      console.log('✅ Media item saved to database');
    } catch (dbError) {
      console.warn('⚠️ Could not save media to database:', dbError);
      // Continue anyway, the file was uploaded successfully
    }

    return NextResponse.json({
      media: mediaItem,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET endpoint para listar archivos subidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const mediaItems = await dbAdapter.findMany('media', {}, {
      limit,
      skip,
      sort: { updatedAt: -1 }
    });

    return NextResponse.json({
      items: mediaItems,
      total: mediaItems.length
    });
  } catch (error) {
    console.error('❌ Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
