import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig } from '@config/cms.config';
import { createStorageAdapter } from '@config/storage';
import { createDatabaseAdapter } from '@config/database';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');
    const key = searchParams.get('key');

    if (!mediaId && !key) {
      return NextResponse.json(
        { error: 'Media ID or key is required' },
        { status: 400 }
      );
    }

    const dbAdapter = createDatabaseAdapter(defaultConfig);
    const storageAdapter = createStorageAdapter(defaultConfig);

    // If we have mediaId, get the media item from database
    let mediaItem = null;
    if (mediaId) {
      mediaItem = await dbAdapter.findOne('media', { id: mediaId });
      if (!mediaItem) {
        return NextResponse.json(
          { error: 'Media not found' },
          { status: 404 }
        );
      }
    }

    // Determine the key to delete
    const fileKey = key || (mediaItem ? mediaItem.data.filename : null);
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Could not determine file key' },
        { status: 400 }
      );
    }

    // Delete from storage
    const deleted = await storageAdapter.deleteFile(fileKey);
    
    if (!deleted) {
      console.warn('⚠️ File might not exist in storage:', fileKey);
    }

    // Delete from database if we have mediaId
    if (mediaId) {
      await dbAdapter.deleteOne('media', { id: mediaId });
    }

    console.log('✅ Media deleted:', fileKey);

    return NextResponse.json({
      message: 'Media deleted successfully',
      key: fileKey
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
