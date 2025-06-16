'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { FileUploadForm } from '@/components/file-upload-form';
import { RemoteUploadForm } from '@/components/remote-upload-form';
import { FilesTable } from '@/components/files-table';
import { UserFile, getUserFiles } from '@/lib/firebase/storage'; // Assuming storage.ts exports UserFile and getUserFiles
import { Loader2 } from 'lucide-react';

export default function MyFilesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  const fetchFiles = useCallback(async () => {
    if (user) {
      setIsLoadingFiles(true);
      try {
        const userFiles = await getUserFiles(user.uid);
        // Sort files by upload date, newest first
        userFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        setFiles(userFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        // Handle error (e.g., show a toast)
      } finally {
        setIsLoadingFiles(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchFiles();
      }
    }
  }, [user, authLoading, isAuthenticated, router, fetchFiles]);

  const handleUploadSuccess = useCallback((newFile: Pick<UserFile, 'name' | 'downloadUrl' | 'size' | 'fullPath'>) => {
    // This is a simplified update. In a real app, the newFile object from uploadFile
    // might not have all UserFile fields (like ID from Firestore).
    // You might need to refetch or construct a complete UserFile object.
    const completeNewFile: UserFile = {
      id: newFile.fullPath, // Use fullPath as a temporary unique ID if no Firestore ID
      ...newFile,
      uploadedAt: new Date(),
      type: newFile.name.split('.').pop() || 'generic', // Basic type detection
    };
    setFiles(prevFiles => [completeNewFile, ...prevFiles].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
  }, []);

  const handleRemoteUploadSuccess = useCallback((newFile: UserFile) => {
    // Similar to handleUploadSuccess, this is a client-side update.
    // The backend would actually create the file and its metadata.
     setFiles(prevFiles => [newFile, ...prevFiles].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
  }, []);

  const handleFileDelete = useCallback((fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  }, []);


  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your space...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">File Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FileUploadForm onUploadSuccess={handleUploadSuccess} />
          <RemoteUploadForm onRemoteUploadSuccess={handleRemoteUploadSuccess} />
        </div>
      </div>
      <FilesTable files={files} onFileDelete={handleFileDelete} isLoading={isLoadingFiles} />
    </div>
  );
}
