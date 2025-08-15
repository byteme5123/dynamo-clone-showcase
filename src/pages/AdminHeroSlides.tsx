import React, { useState } from 'react';
import { useHeroSlides, useAdminHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide } from '@/hooks/useHeroSlides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/hooks/use-toast';

const AdminHeroSlides = () => {
  const { data: slides, isLoading, error } = useAdminHeroSlides();
  const createMutation = useCreateHeroSlide();
  const updateMutation = useUpdateHeroSlide();
  const deleteMutation = useDeleteHeroSlide();

  const [editingSlide, setEditingSlide] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: '',
    cta_url: '',
    display_order: 0,
    is_active: true,
    page_type: 'home' as 'home' | 'about' | 'wireless_pbx'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      cta_text: '',
      cta_url: '',
      display_order: 0,
      is_active: true,
      page_type: 'home' as 'home' | 'about' | 'wireless_pbx'
    });
    setEditingSlide(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate image upload
    if (!formData.image_url) {
      toast({
        title: "Error",
        description: "Please upload an image for the hero slide",
        variant: "destructive",
      });
      return;
    }

    // Validate slide limits per page type
    if (formData.is_active) {
      const activeSlides = slides?.filter(slide => 
        slide.page_type === formData.page_type && 
        slide.is_active && 
        (!editingSlide || slide.id !== editingSlide.id)
      ) || [];
      
      const maxSlides = formData.page_type === 'home' ? 3 : 1;
      
      if (activeSlides.length >= maxSlides) {
        toast({
          title: "Limit Exceeded",
          description: `Maximum ${maxSlides} active slide${maxSlides > 1 ? 's' : ''} allowed for ${formData.page_type === 'home' ? 'Home' : formData.page_type === 'about' ? 'About' : 'Wireless PBX'} page`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (editingSlide) {
        await updateMutation.mutateAsync({ id: editingSlide.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image_url: slide.image_url || '',
      cta_text: slide.cta_text || '',
      cta_url: slide.cta_url || '',
      display_order: slide.display_order || 0,
      is_active: slide.is_active,
      page_type: slide.page_type || 'home'
    });
    setShowDialog(true);
  };

  const handleToggleActive = async (slide) => {
    try {
      await updateMutation.mutateAsync({
        id: slide.id,
        is_active: !slide.is_active
      });
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const handleDelete = async (slideId) => {
    try {
      await deleteMutation.mutateAsync(slideId);
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading hero slides: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hero Slides</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="page_type">Page Type *</Label>
                  <Select
                    value={formData.page_type}
                    onValueChange={(value) => setFormData({ ...formData, page_type: value as 'home' | 'about' | 'wireless_pbx' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select page type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Page</SelectItem>
                      <SelectItem value="about">About Page</SelectItem>
                      <SelectItem value="wireless_pbx">Wireless PBX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Hero Image *</Label>
                <ImageUpload
                  bucket="hero-images"
                  folder="slides"
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  existingImage={formData.image_url}
                  className="mt-2"
                />
                {!formData.image_url && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please upload an image for the hero slide
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_url">CTA URL</Label>
                  <Input
                    id="cta_url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    placeholder="/plans"
                  />
                </div>
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
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.image_url}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingSlide ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Hero Slides</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides?.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>{slide.display_order}</TableCell>
                  <TableCell className="font-medium">{slide.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {slide.page_type === 'home' && 'Home'}
                      {slide.page_type === 'about' && 'About'}
                      {slide.page_type === 'wireless_pbx' && 'Wireless PBX'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{slide.subtitle}</TableCell>
                  <TableCell>
                    <Badge variant={slide.is_active ? "default" : "secondary"}>
                      {slide.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(slide)}
                        disabled={updateMutation.isPending}
                      >
                        {slide.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(slide)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hero Slide</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this hero slide? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(slide.id)}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHeroSlides;