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

interface Translation {
  id: string;
  key: string;
  en: string;
  es: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const AdminTranslations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    en: '',
    es: '',
    category: 'general'
  });

  const categories = ['general', 'navigation', 'plans', 'contact', 'hero', 'features'];

  const { data: translations, isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      return data as Translation[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Translation, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('translations')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: 'Success',
        description: 'Translation created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create translation',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Translation> & { id: string }) => {
      const { error } = await supabase
        .from('translations')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: 'Success',
        description: 'Translation updated successfully',
      });
      setIsDialogOpen(false);
      setEditingTranslation(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update translation',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: 'Success',
        description: 'Translation deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete translation',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      en: '',
      es: '',
      category: 'general'
    });
    setEditingTranslation(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      en: translation.en,
      es: translation.es,
      category: translation.category
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.key || !formData.en || !formData.es) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (editingTranslation) {
      updateMutation.mutate({ id: editingTranslation.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTranslations = translations?.filter(translation => {
    const matchesSearch = translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.es.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || translation.category === filterCategory;
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
          <h1 className="text-2xl font-bold">Translations Management</h1>
          <p className="text-muted-foreground">
            Manage multilingual content for your application
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Translation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? 'Edit Translation' : 'Add New Translation'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key</label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., hero.title"
                />
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
              <div>
                <label className="text-sm font-medium">English</label>
                <Textarea
                  value={formData.en}
                  onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                  placeholder="English text"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Spanish</label>
                <Textarea
                  value={formData.es}
                  onChange={(e) => setFormData({ ...formData, es: e.target.value })}
                  placeholder="Spanish text"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTranslation ? 'Update' : 'Create'}
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
          <CardTitle>All Translations</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
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
                <TableHead>English</TableHead>
                <TableHead>Spanish</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranslations.map((translation) => (
                <TableRow key={translation.id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {translation.key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {translation.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {translation.en}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {translation.es}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(translation)}
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
                            <AlertDialogTitle>Delete Translation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the translation for "{translation.key}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(translation.id)}
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
          
          {filteredTranslations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterCategory !== 'all' ? 'No translations match your search criteria' : 'No translations found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTranslations;