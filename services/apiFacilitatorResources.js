import supabase from './supabase';
import { Platform } from 'react-native';
import { getUserByIdFromAuth } from './apiRecords';

// Dynamically import expo modules only on native
async function getFileSystemModule() {
  if (Platform.OS !== 'web') {
    try {
      const module = await import('expo-file-system');
      return module;
    } catch (error) {
      console.warn('expo-file-system not available:', error);
      return null;
    }
  }
  return null;
}

async function getSharingModule() {
  if (Platform.OS !== 'web') {
    try {
      const module = await import('expo-sharing');
      return module;
    } catch (error) {
      console.warn('expo-sharing not available:', error);
      return null;
    }
  }
  return null;
}

export async function addFacilitatorResource(userId, file, chapter) {
  try {
    // Verify user is a facilitator
    const user = await getUserByIdFromAuth(userId);
    if (user.userType !== 'tutor') {
      throw new Error('Only facilitators can upload resources');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `facilitator_${userId}_${timestamp}_${sanitizedName}`;

    let blobData;

    // Handle web File objects
    if (typeof window !== 'undefined' && file instanceof File) {
      blobData = file;
    } else {
      // Handle native file URIs
      const FileSystem = await getFileSystemModule();
      if (!FileSystem) {
        throw new Error('File system not available');
      }
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      blobData = await (await fetch(`data:application/pdf;base64,${fileContent}`)).blob();
    }

    // Upload file to Supabase storage with correct MIME type
    const { error: uploadError } = await supabase.storage
      .from('facilitator_resources')
      .upload(filename, blobData, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('File upload failed: ' + uploadError.message);
    }

    const { data: insertData, error: dbError } = await supabase
      .from('facilitator_resources')
      .insert([
        {
          userid: userId,
          filename: file.name,
          file: filename,
          chapter: chapter,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (!chapter) {
      throw new Error('Chapter selecting is required');
    }

    if (dbError) {
      try {
        await supabase.storage
          .from('facilitator_resources')
          .remove([filename]);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw new Error('Failed to save resource metadata: ' + dbError.message);
    }

    return insertData;
  } catch (error) {
    console.error('Error adding facilitator resource:', error);
    throw error;
  }
}

export async function getFacilitatorResources(userId) {
  try {
    const { data, error } = await supabase
      .from('facilitator_resources')
      .select('*')
      .eq('userid', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      throw new Error('Failed to fetch resources: ' + error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching facilitator resources:', error);
    throw error;
  }
}

export async function deleteFacilitatorResource(resourceId, userId) {
  const { data, error: fetchError } = await supabase
    .from('facilitator_resources')
    .select('file, userid')
    .eq('id', resourceId)
    .single();

  if (fetchError || !data) {
    throw new Error('Resource not found');
  }

  if (data.userid !== userId) {
    throw new Error('Unauthorized delete attempt');
  }

  const { error: storageError } = await supabase.storage
    .from('facilitator_resources')
    .remove([data.file]);

  if (storageError) {
    console.error('Storage deletion failed:', storageError);
    throw new Error('Storage deletion failed');
  }

  const { error: dbError } = await supabase
    .from('facilitator_resources')
    .delete()
    .eq('id', resourceId);

  if (dbError) {
    throw new Error('Database deletion failed');
  }
}


export async function downloadFacilitatorResource(resource) {
  try {
    // Get the download URL
    const { data } = supabase.storage
      .from('facilitator_resources')
      .getPublicUrl(resource.file);

    const url = data.publicUrl;

    // For web, just open in new tab
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
      return;
    }

    // For native, download and share
    const FileSystem = await getFileSystemModule();
    const Sharing = await getSharingModule();

    if (!FileSystem || !Sharing) {
      throw new Error('File sharing not available');
    }

    const filename = resource.filename;
    const localPath = `${FileSystem.documentDirectory}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(url, localPath);

    if (downloadResult.status === 200) {
      await Sharing.shareAsync(downloadResult.uri);
    } else {
      throw new Error('Download failed with status: ' + downloadResult.status);
    }
  } catch (error) {
    console.error('Error downloading facilitator resource:', error);
    throw error;
  }
}

export async function getFacilitatorResourcesByChapter(chapter) {
  const { data, error } = await supabase
    .from('facilitator_resources')
    .select('id, filename, file, chapter, timestamp')
    .eq('chapter', chapter)
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

// Web file picker helper
export function selectFileWeb() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        resolve(file);
      } else if (file) {
        reject(new Error('Please select a valid PDF file'));
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
}
