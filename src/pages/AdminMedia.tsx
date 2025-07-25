import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Search, Download, Copy } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
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
} from '@/components/ui/alert-dialog';

const AdminMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('hero-images');

  const buckets = [
    { id: 'hero-images', name: 'Hero Images' },
    { id: 'plan-images', name: 'Plan Images' },
    { id: 'logos', name: 'Logos' },
    { id: 'seo-images', name: 'SEO Images' },
  ];

  const { data: files, isLoading } = useQuery({
    queryKey: ['media-files', selectedBucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .list('', { limit: 100 });

      if (error) throw error;
      
      // Get public URLs for each file
      const filesWithUrls = data.map(file => {
        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(file.name);
        
        return {
          ...file,
          publicUrl: urlData.publicUrl
        };
      });

      return filesWithUrls;
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from(selectedBucket)
        .remove([fileName]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files', selectedBucket] });
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard',
    });
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const filteredFiles = files?.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUploadComplete = (url: string) => {
    queryClient.invalidateQueries({ queryKey: ['media-files', selectedBucket] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your images and files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload New File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Bucket</label>
                  <select
                    value={selectedBucket}
                    onChange={(e) => setSelectedBucket(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {buckets.map(bucket => (
                      <option key={bucket.id} value={bucket.id}>
                        {bucket.name}
                      </option>
                    ))}
                  </select>
                </div>
                <ImageUpload
                  bucket={selectedBucket}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Files in {buckets.find(b => b.id === selectedBucket)?.name}</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <div key={file.name} className="border rounded-lg p-4 space-y-2">
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) : '0')} KB
                        </p>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(file.publicUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file.publicUrl, file.name)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFileMutation.mutate(file.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No files match your search' : 'No files found in this bucket'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMedia;