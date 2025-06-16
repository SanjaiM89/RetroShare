'use client';

import { UserFile, deleteUserFile } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Download, Trash2, FileText, Image as ImageIcon, Video, Music, Archive, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface FilesTableProps {
  files: UserFile[];
  onFileDelete: (fileId: string) => void;
  isLoading?: boolean;
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'document':
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileText className="w-5 h-5 text-primary" />;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <ImageIcon className="w-5 h-5 text-green-500" />;
    case 'video':
    case 'mp4':
    case 'mov':
    case 'avi':
      return <Video className="w-5 h-5 text-purple-500" />;
    case 'audio':
    case 'mp3':
    case 'wav':
      return <Music className="w-5 h-5 text-yellow-500" />;
    case 'archive':
    case 'zip':
    case 'rar':
      return <Archive className="w-5 h-5 text-orange-500" />;
    default:
      return <FileText className="w-5 h-5 text-muted-foreground" />;
  }
};

export function FilesTable({ files, onFileDelete, isLoading = false }: FilesTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores ID of file being deleted

  const handleDelete = async (fileId: string, fullPath: string) => {
    setIsDeleting(fileId);
    try {
      await deleteUserFile(fullPath);
      onFileDelete(fileId);
      toast({
        title: 'File Deleted',
        description: 'The file has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error Deleting File',
        description: error.message || 'Could not delete the file.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg mt-8">
      <h3 className="text-xl font-semibold text-foreground mb-4">My Files</h3>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You haven&apos;t uploaded any files yet.</p>
          <p className="text-sm text-muted-foreground">Use the forms above to upload files directly or from a remote URL/torrent.</p>
        </div>
      ) : (
        <Table>
          <TableCaption className="text-muted-foreground">A list of your uploaded files. Files are automatically deleted after 24 hours.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{getFileIcon(file.type)}</TableCell>
                <TableCell className="font-medium text-foreground/90 break-all">{file.name}</TableCell>
                <TableCell className="text-muted-foreground">{file.size}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(file.uploadedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild
                    className="hover:bg-primary/10 hover:border-primary text-primary border-primary/50"
                    disabled={isDeleting === file.id}
                  >
                    <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" download={file.name}>
                      <Download className="mr-1 h-4 w-4" /> Download
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting === file.id}>
                        {isDeleting === file.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                        {isDeleting === file.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the file
                          <span className="font-semibold"> {file.name}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id, file.fullPath)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Yes, delete file
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
