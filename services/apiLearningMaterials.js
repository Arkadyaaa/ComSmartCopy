import { Platform } from 'react-native';
// import supabase from './supabase'; // Uncomment when ready to use Supabase

// Mock storage for learning materials (replace with Supabase later)
let mockMaterials = [
  {
    id: '1',
    chapterNumber: 1,
    name: 'Introduction to Computer Hardware.pdf',
    type: 'pdf',
    uploadedBy: 'Tutor',
    uploadedAt: new Date('2024-01-15').toISOString(),
    size: 2048000, // bytes
  },
  {
    id: '2',
    chapterNumber: 2,
    name: 'Operating Systems Overview.mp4',
    type: 'video',
    uploadedBy: 'Tutor',
    uploadedAt: new Date('2024-01-20').toISOString(),
    size: 15728640, // bytes
  },
  {
    id: '3',
    chapterNumber: 3,
    name: 'Troubleshooting Guide.png',
    type: 'image',
    uploadedBy: 'Tutor',
    uploadedAt: new Date('2024-01-25').toISOString(),
    size: 512000, // bytes
  },
];

// Web file picker helper
export function selectFileWeb(acceptTypes = '.pdf,.mp4,.mov,.avi,.png,.jpg,.jpeg') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptTypes;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
}

// Get file type from filename
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  return 'other';
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get all learning materials
 * TODO: Replace with Supabase query
 * Example Supabase implementation:
 * const { data, error } = await supabase
 *   .from('learning_materials')
 *   .select('*')
 *   .order('uploaded_at', { ascending: false });
 */
export async function getLearningMaterials(chapterNumber = null) {
  try {
    // Mock implementation - replace with Supabase
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    // TODO: Replace with Supabase
    // const { data, error } = await supabase
    //   .from('learning_materials')
    //   .select('*')
    //   .order('uploaded_at', { ascending: false })
    //   .eq('chapter_number', chapterNumber);
    // if (error) throw error;
    // return data || [];
    
    if (!chapterNumber) {
      return [...mockMaterials];
    }
    return mockMaterials.filter(m => m.chapterNumber === chapterNumber);
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    throw error;
  }
}

/**
 * Upload a learning material
 * @param {string} userId - User ID of the uploader
 * @param {File|Object} file - File to upload
 * @param {string} fileName - Optional custom file name
 * TODO: Replace with Supabase storage upload
 * Example Supabase implementation:
 * const fileExt = file.name.split('.').pop();
 * const fileName = `${userId}_${Date.now()}.${fileExt}`;
 * const { data, error } = await supabase.storage
 *   .from('learning-materials')
 *   .upload(fileName, file);
 * Then insert record into learning_materials table
 */
export async function uploadLearningMaterial(userId, file, fileName = null, chapterNumber = null) {
  try {
    // Mock implementation - replace with Supabase
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
    
    const fileType = getFileType(file.name || fileName);
    const newMaterial = {
      id: Date.now().toString(),
      chapterNumber: chapterNumber || 1,
      name: fileName || file.name,
      type: fileType,
      uploadedBy: 'Tutor', // TODO: Get from user data
      uploadedAt: new Date().toISOString(),
      size: file.size || 0,
    };
    
    mockMaterials.unshift(newMaterial);
    
    // TODO: Replace with Supabase
    // 1. Upload file to Supabase Storage
    // const fileExt = file.name.split('.').pop();
    // const storageFileName = `${userId}_${Date.now()}.${fileExt}`;
    // 
    // let fileData;
    // if (Platform.OS === 'web' && file instanceof File) {
    //   fileData = file;
    // } else {
    //   // Handle native file
    //   const FileSystem = await getFileSystemModule();
    //   fileData = await FileSystem.readAsStringAsync(file.uri, {
    //     encoding: FileSystem.EncodingType.Base64,
    //   });
    // }
    // 
    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from('learning-materials')
    //   .upload(storageFileName, fileData, {
    //     contentType: file.mimeType || 'application/octet-stream',
    //   });
    // 
    // if (uploadError) throw uploadError;
    // 
    // // 2. Insert record into database
    // const { data: recordData, error: recordError } = await supabase
    //   .from('learning_materials')
    //   .insert({
    //     name: fileName || file.name,
    //     type: fileType,
    //     storage_path: uploadData.path,
    //     uploaded_by: userId,
    //     file_size: file.size,
    //   });
    // 
    // if (recordError) throw recordError;
    // return recordData;
    
    return newMaterial;
  } catch (error) {
    console.error('Error uploading learning material:', error);
    throw error;
  }
}

/**
 * Delete a learning material
 * @param {string} materialId - ID of the material to delete
 * @param {string} userId - User ID (for authorization check)
 * TODO: Replace with Supabase delete
 */
export async function deleteLearningMaterial(materialId, userId) {
  try {
    // Mock implementation - replace with Supabase
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // TODO: Replace with Supabase
    // 1. Get material to check ownership and get storage path
    // const { data: material, error: fetchError } = await supabase
    //   .from('learning_materials')
    //   .select('*')
    //   .eq('id', materialId)
    //   .single();
    // 
    // if (fetchError) throw fetchError;
    // 
    // // 2. Delete from storage
    // const { error: storageError } = await supabase.storage
    //   .from('learning-materials')
    //   .remove([material.storage_path]);
    // 
    // if (storageError) throw storageError;
    // 
    // // 3. Delete record
    // const { error: deleteError } = await supabase
    //   .from('learning_materials')
    //   .delete()
    //   .eq('id', materialId);
    // 
    // if (deleteError) throw deleteError;
    
    mockMaterials = mockMaterials.filter(m => m.id !== materialId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting learning material:', error);
    throw error;
  }
}

/**
 * Download/view a learning material
 * @param {Object} material - Material object
 * TODO: Replace with Supabase storage download
 */
export async function downloadLearningMaterial(material) {
  try {
    // Mock implementation - replace with Supabase
    console.log('Downloading material:', material.name);
    
    // TODO: Replace with Supabase
    // const { data, error } = await supabase.storage
    //   .from('learning-materials')
    //   .download(material.storage_path);
    // 
    // if (error) throw error;
    // 
    // // Handle download based on platform
    // if (Platform.OS === 'web') {
    //   const url = URL.createObjectURL(data);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = material.name;
    //   link.click();
    //   URL.revokeObjectURL(url);
    // } else {
    //   const FileSystem = await getFileSystemModule();
    //   const Sharing = await getSharingModule();
    //   // Save and share file
    // }
    
    alert(`Mock download: ${material.name}`);
  } catch (error) {
    console.error('Error downloading learning material:', error);
    throw error;
  }
}

