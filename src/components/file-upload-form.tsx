'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadFile, UserFile } from '@/lib/firebase/storage'; // Assuming uploadFile returns minimal UserFile info or similar
import { useToast } from "@/hooks/use-toast";


interface FileUploadFormProps {
  onUploadSuccess: (file: Pick<UserFile, 'name' | 'downloadUrl' | 'size' | 'fullPath'>) => void;
}

export function FileUploadForm({ onUploadSuccess }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Firebase Storage limits individual file uploads typically to a few GBs via browser.
      // Very large files (100GB) usually require resumable uploads possibly chunked or server-side handling.
      // For this scaffold, we'll assume smaller files or user understands browser limits.
      if (e.target.files[0].size > 5 * 1024 * 1024 * 1024) { // 5GB example limit for browser
         setError("File size exceeds 5GB. For larger files, please use remote upload options or ensure your setup supports it.");
         setFile(null);
         return;
      }
      setFile(e.target.files[0]);
      setError(null);
      setSuccessMessage(null);
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    try {
      const uploadedFileInfo = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setSuccessMessage(`File "${uploadedFileInfo.name}" uploaded successfully!`);
      onUploadSuccess(uploadedFileInfo); // Callback to parent
      setFile(null); // Reset file input
      toast({
        title: "Upload Successful",
        description: `${uploadedFileInfo.name} has been uploaded.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || 'File upload failed.');
      toast({
        title: "Upload Failed",
        description: err.message || "An unknown error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null); // Hide progress bar after completion or error
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-4">Upload Your File</h3>
      <p className="text-sm text-muted-foreground mb-1">Max file size: 100GB (browser upload may have practical limits).</p>
      <p className="text-sm text-muted-foreground mb-4">Files are automatically deleted after 24 hours.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-foreground/80">Select file</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            disabled={isUploading}
          />
          {file && !isUploading && (
            <p className="mt-2 text-sm text-muted-foreground flex items-center">
              <FileIcon className="w-4 h-4 mr-2 text-primary" />
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploadProgress !== null && isUploading && (
          <div className="space-y-1">
            <Label className="text-sm text-foreground/80">Upload Progress</Label>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground text-right">{uploadProgress.toFixed(0)}%</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
           <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full sm:w-auto" disabled={!file || isUploading}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </form>
    </div>
  );
}
