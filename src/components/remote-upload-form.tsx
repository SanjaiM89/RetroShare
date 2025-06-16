
'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link as LinkIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { addRemoteFile, UserFile } from '@/lib/firebase/storage';
import { useToast } from "@/hooks/use-toast";

interface RemoteUploadFormProps {
  onRemoteUploadSuccess: (file: UserFile) => void;
}

export function RemoteUploadForm({ onRemoteUploadSuccess }: RemoteUploadFormProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sourceUrl) {
      setError('Please enter a direct download URL.');
      return;
    }

    // Basic URL validation (can be improved)
    try {
      new URL(sourceUrl);
    } catch (_) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // In a real implementation, this would call a Cloud Function.
      // The Cloud Function would handle downloading from the URL and uploading to Firebase Storage.
      const remoteFile = await addRemoteFile(sourceUrl);
      setSuccessMessage(`Remote file "${remoteFile.name}" processing has been initiated.`);
      onRemoteUploadSuccess(remoteFile); // Callback to parent with placeholder data
      setSourceUrl(''); // Reset input
      toast({
        title: "Remote Upload Initiated",
        description: `Processing of ${remoteFile.name} has started. Check back later for completion.`,
      });
    } catch (err: any) {
      console.error("Remote upload initiation error:", err);
      setError(err.message || 'Failed to initiate remote upload.');
       toast({
        title: "Remote Upload Failed",
        description: err.message || "Could not start remote upload processing.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-4">Remote Upload (Direct URL)</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enter a direct download URL. The file will be processed by our server and added to your storage.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="direct-url" className="text-foreground/80">Enter Direct Download URL</Label>
          <Input
            id="direct-url"
            type="url"
            value={sourceUrl}
            onChange={(e) => {
              setSourceUrl(e.target.value);
              setError(null); // Clear error when user types
            }}
            placeholder="https://example.com/file.zip"
            className="mt-1 bg-background border-border focus:border-primary focus:ring-primary"
            disabled={isUploading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Processing Initiated</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full sm:w-auto" disabled={!sourceUrl || isUploading}>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LinkIcon className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Initiating...' : 'Add Remote File'}
        </Button>
      </form>
    </div>
  );
}
