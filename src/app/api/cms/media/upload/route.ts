import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig } from '@config/cms.config';
import { createStorageAdapter } from '@config/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > defaultConfig.maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${defaultConfig.maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!defaultConfig.allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const key = `uploads/${timestamp}-${randomId}.${extension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage (mock for now)
    const storageAdapter = createStorageAdapter(defaultConfig);
    const url = await storageAdapter.uploadFile(buffer, key, file.type);

    // Mock response for now
    const mockUrl = `/uploads/${key}`;

    const mediaItem = {
      id: `media_${timestamp}`,
      originalName: file.name,
      filename: key,
      url: mockUrl,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    console.log('File uploaded (mock):', mediaItem);

    return NextResponse.json({
      media: mediaItem,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
