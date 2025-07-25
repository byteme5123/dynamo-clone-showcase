import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'text',
    category: 'general',
    description: ''
  });

  const categories = ['general', 'contact', 'social', 'branding', 'features'];
  const types = ['text', 'url', 'email', 'number', 'boolean', 'image'];

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('site_settings')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Success',
        description: 'Setting created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create setting',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SiteSetting> & { id: string }) => {
      const { error } = await supabase
        .from('site_settings')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
      setIsDialogOpen(false);
      setEditingSetting(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Success',
        description: 'Setting deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete setting',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      type: 'text',
      category: 'general',
      description: ''
    });
    setEditingSetting(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (setting: SiteSetting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      type: setting.type,
      category: setting.category,
      description: setting.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.key || !formData.value) {
      toast({
        title: 'Error',
        description: 'Key and value are required',
        variant: 'destructive',
      });
      return;
    }

    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderValueInput = () => {
    if (formData.type === 'image') {
      return (
        <ImageUpload
          bucket="logos"
          onUploadComplete={(url) => setFormData({ ...formData, value: url })}
          existingImage={formData.value}
        />
      );
    }

    if (formData.type === 'boolean') {
      return (
        <select
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (formData.type === 'text' && formData.key.includes('description')) {
      return (
        <Textarea
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="Setting value"
        />
      );
    }

    return (
      <Input
        type={formData.type === 'number' ? 'number' : 'text'}
        value={formData.value}
        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
        placeholder="Setting value"
      />
    );
  };

  const filteredSettings = settings?.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (setting.description && setting.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

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
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage your website configuration and settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? 'Edit Setting' : 'Add New Setting'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key</label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., site.title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Value</label>
                {renderValueInput()}
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSetting ? 'Update' : 'Create'}
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
          <CardTitle>All Settings</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {setting.key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {setting.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {setting.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {setting.type === 'image' && setting.value ? (
                      <img src={setting.value} alt="Setting" className="h-8 w-8 object-cover rounded" />
                    ) : (
                      <span className="truncate">{setting.value}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(setting)}
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
                            <AlertDialogTitle>Delete Setting</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the setting "{setting.key}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(setting.id)}
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
          
          {filteredSettings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterCategory !== 'all' ? 'No settings match your search criteria' : 'No settings found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;