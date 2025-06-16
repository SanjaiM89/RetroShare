
import { ref, uploadBytesResumable, getDownloadURL as getStorageDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth, app } from './config'; // Added app import
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { formatFileSize } from '@/lib/utils'; // Assuming utils.ts exports this

export interface UserFile {
  id: string; // Usually the file name or a unique ID from Firestore
  name: string;
  size: string; // e.g., "1.2 GB"
  uploadedAt: Date;
  downloadUrl: string;
  type: string; // For icon: 'document', 'image', 'video', 'audio', 'archive', 'generic'
  fullPath: string; // Firebase storage full path, needed for deletion
}

// Placeholder for uploading a file
export const uploadFile = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<Pick<UserFile, 'name' | 'downloadUrl' | 'size' | 'fullPath'>> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated for file upload.');

  const filePath = `userFiles/${user.uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getStorageDownloadURL(uploadTask.snapshot.ref);
        resolve({
          name: file.name,
          downloadUrl,
          size: formatFileSize(file.size),
          fullPath: filePath,
        });
      }
    );
  });
};


// Function to initiate remote file processing via a Cloud Function
export const addRemoteFile = async (
  sourceUrl: string
): Promise<UserFile> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated for remote file processing.');

  console.log(`Initiating remote file processing for URL: ${sourceUrl} by user ${user.uid}`);

  const functions = getFunctions(app); // Use the 'app' instance from your config
  const processRemoteUrlCallable = httpsCallable(functions, 'processRemoteUrl');

  try {
    // Call the Cloud Function
    const result = await processRemoteUrlCallable({ sourceUrl });
    const data = result.data as any; // Type this according to your CF's return type

    if (!data.filePath || !data.fileName) {
      throw new Error('Cloud Function did not return expected file path or name.');
    }
    
    // Get a downloadable URL for the file path returned by the Cloud Function
    const fileRef = ref(storage, data.filePath);
    const downloadUrl = await getStorageDownloadURL(fileRef);

    return {
      id: data.filePath, // Use the actual file path as ID
      name: data.fileName,
      size: data.size ? formatFileSize(data.size) : "N/A",
      uploadedAt: new Date(), // Timestamp of when the CF call completed
      downloadUrl: downloadUrl,
      type: data.contentType ? getFileTypeFromContentType(data.contentType) : 'generic',
      fullPath: data.filePath,
    };

  } catch (error: any) {
    console.error('Error calling processRemoteUrl Cloud Function:', error);
    let errorMessage = 'Failed to initiate server-side file processing.';
    if (error.code && error.message) { // Firebase FunctionsError
        errorMessage = `Error: ${error.message} (Code: ${error.code})`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

// Helper to determine file type from content type
const getFileTypeFromContentType = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType.includes('document') || contentType.includes('text')) return 'document';
  if (contentType.includes('zip') || contentType.includes('archive')) return 'archive';
  return 'generic';
};


// Placeholder for getting user's files
export const getUserFiles = async (userId: string): Promise<UserFile[]> => {
  console.log(`Fetching files for user: ${userId}`);
  // This is a placeholder. In a real app, this would fetch from Firestore or list Firebase Storage.
  return [];
};

// Placeholder for deleting a file
export const deleteUserFile = async (fullPath: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated for file deletion.');

  if (fullPath.startsWith(`userFiles/${user.uid}/`)) {
    const fileRef = ref(storage, fullPath);
    try {
      await deleteObject(fileRef);
      console.log(`File deleted from storage: ${fullPath}`);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`File not found for deletion, possibly already deleted: ${fullPath}`);
      } else {
        console.error('Error deleting file from storage:', error);
        throw error;
      }
    }
  } else {
    console.warn(`Attempt to delete file with unexpected path: ${fullPath} by user ${user.uid}. Deletion aborted.`);
  }
};
