import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { 
  useAdminWirelessPBXContent, 
  useCreateWirelessPBXContent, 
  useUpdateWirelessPBXContent, 
  useDeleteWirelessPBXContent,
  WirelessPBXContent 
} from '@/hooks/useWirelessPBXContent';
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

const AdminWirelessPBX = () => {
  const { data: contents = [], isLoading } = useAdminWirelessPBXContent();
  const createContent = useCreateWirelessPBXContent();
  const updateContent = useUpdateWirelessPBXContent();
  const deleteContent = useDeleteWirelessPBXContent();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<WirelessPBXContent | null>(null);
  const [formData, setFormData] = useState({
    section: '',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    cta_text: '',
    cta_url: '',
    features: '',
    display_order: 0,
    is_active: true,
  });

  const sectionOptions = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'intro', label: 'Introduction' },
    { value: 'features', label: 'Features' },
    { value: 'services', label: 'Services' },
    { value: 'locations', label: 'Usage Locations' },
    { value: 'cta', label: 'Call to Action' },
  ];

  const handleCreate = () => {
    setFormData({
      section: '',
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      cta_text: '',
      cta_url: '',
      features: '',
      display_order: 0,
      is_active: true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (content: WirelessPBXContent) => {
    setEditingContent(content);
    setFormData({
      section: content.section,
      title: content.title || '',
      subtitle: content.subtitle || '',
      content: content.content || '',
      image_url: content.image_url || '',
      cta_text: content.cta_text || '',
      cta_url: content.cta_url || '',
      features: JSON.stringify(content.features, null, 2) || '',
      display_order: content.display_order,
      is_active: content.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedFeatures = null;
    if (formData.features.trim()) {
      try {
        parsedFeatures = JSON.parse(formData.features);
      } catch (error) {
        console.error('Invalid JSON in features field');
        return;
      }
    }

    const contentData = {
      ...formData,
      features: parsedFeatures,
    };

    if (editingContent) {
      updateContent.mutate({ 
        id: editingContent.id, 
        ...contentData 
      });
      setIsEditDialogOpen(false);
    } else {
      createContent.mutate(contentData);
      setIsCreateDialogOpen(false);
    }
    
    setEditingContent(null);
  };

  const handleDelete = (id: string) => {
    deleteContent.mutate(id);
  };

  const toggleActive = (content: WirelessPBXContent) => {
    updateContent.mutate({
      id: content.id,
      is_active: !content.is_active,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const contentDialog = (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingContent ? 'Edit Content' : 'Create New Content'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select 
              value={formData.section} 
              onValueChange={(value) => setFormData({ ...formData, section: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Content title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Content subtitle"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Main content text"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Image</Label>
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
            existingImage={formData.image_url}
            bucket="hero-images"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cta_text">CTA Text</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              placeholder="Button text"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cta_url">CTA URL</Label>
            <Input
              id="cta_url"
              value={formData.cta_url}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
              placeholder="/contact"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="features">Features (JSON)</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder='{"key": "value"} or [{"icon": "Phone", "title": "Feature"}]'
            rows={6}
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Enter JSON data for complex features. Leave empty if not needed.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingContent(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createContent.isPending || updateContent.isPending}
          >
            {editingContent ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wireless PBX Content Management</h1>
          <p className="text-muted-foreground">
            Manage all content for the Wireless PBX page
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          {contentDialog}
        </Dialog>
      </div>

      <div className="grid gap-6">
        {sectionOptions.map(({ value, label }) => {
          const sectionContents = contents.filter(content => content.section === value);
          
          return (
            <Card key={value}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{label}</span>
                  <Badge variant="secondary">
                    {sectionContents.length} item{sectionContents.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sectionContents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No content found for this section
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sectionContents.map((content) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{content.title || 'Untitled'}</h3>
                            <Badge variant={content.is_active ? 'default' : 'secondary'}>
                              {content.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleActive(content)}
                            >
                              {content.is_active ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Dialog open={isEditDialogOpen && editingContent?.id === content.id} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(content)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              {contentDialog}
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this content? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(content.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        {content.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">{content.subtitle}</p>
                        )}
                        {content.content && (
                          <p className="text-sm line-clamp-2">{content.content}</p>
                        )}
                        {content.image_url && (
                          <div className="mt-2">
                            <img 
                              src={content.image_url} 
                              alt={content.title || 'Content image'} 
                              className="w-20 h-12 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminWirelessPBX;