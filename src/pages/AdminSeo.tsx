import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ImageUpload } from '@/components/ImageUpload';

interface SeoSetting {
  id: string;
  page_slug: string;
  meta_title: string;
  meta_description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminSeo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<SeoSetting | null>(null);
  const [formData, setFormData] = useState({
    page_slug: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: ''
  });

  const commonPages = [
    'home', 'about', 'plans', 'contact', 'activate-sim', 'plan-detail'
  ];

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_slug', { ascending: true });

      if (error) throw error;
      return data as SeoSetting[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<SeoSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('seo_settings')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: 'Success',
        description: 'SEO settings created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create SEO settings',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SeoSetting> & { id: string }) => {
      const { error } = await supabase
        .from('seo_settings')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: 'Success',
        description: 'SEO settings updated successfully',
      });
      setIsDialogOpen(false);
      setEditingSeo(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update SEO settings',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: 'Success',
        description: 'SEO settings deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete SEO settings',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      page_slug: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image_url: ''
    });
    setEditingSeo(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (seo: SeoSetting) => {
    setEditingSeo(seo);
    setFormData({
      page_slug: seo.page_slug,
      meta_title: seo.meta_title,
      meta_description: seo.meta_description || '',
      keywords: seo.keywords || '',
      og_title: seo.og_title || '',
      og_description: seo.og_description || '',
      og_image_url: seo.og_image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.page_slug || !formData.meta_title) {
      toast({
        title: 'Error',
        description: 'Page slug and meta title are required',
        variant: 'destructive',
      });
      return;
    }

    if (editingSeo) {
      updateMutation.mutate({ id: editingSeo.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredSeoSettings = seoSettings?.filter(seo =>
    seo.page_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seo.meta_title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">
            Manage SEO settings for your pages
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add SEO Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSeo ? 'Edit SEO Settings' : 'Add New SEO Settings'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-sm font-medium">Page Slug</label>
                <select
                  value={formData.page_slug}
                  onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select a page</option>
                  {commonPages.map(page => (
                    <option key={page} value={page}>
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Or type a custom page slug
                </p>
                <Input
                  value={formData.page_slug}
                  onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                  placeholder="custom-page"
                  className="mt-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Meta Title *</label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Page title for search engines"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Brief description for search results"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Keywords</label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Open Graph Title</label>
                <Input
                  value={formData.og_title}
                  onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                  placeholder="Title for social media sharing"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Open Graph Description</label>
                <Textarea
                  value={formData.og_description}
                  onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                  placeholder="Description for social media sharing"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Open Graph Image</label>
                <ImageUpload
                  bucket="seo-images"
                  onUploadComplete={(url) => setFormData({ ...formData, og_image_url: url })}
                  existingImage={formData.og_image_url}
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSeo ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Meta Title</TableHead>
                <TableHead>Meta Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeoSettings.map((seo) => (
                <TableRow key={seo.id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {seo.page_slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {seo.meta_title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {seo.meta_description || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(seo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete SEO Settings</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete SEO settings for "{seo.page_slug}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(seo.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSeoSettings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No SEO settings match your search' : 'No SEO settings found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeo;