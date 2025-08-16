import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye, Upload } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

const AdminHomepageBranding = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    logo_url: '',
    logo_alt: '',
    navbar_activate_button_text: '',
    navbar_activate_button_url: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        logo_url: settingsMap.logo_url || '',
        logo_alt: settingsMap.logo_alt || 'Dynamo Wireless',
        navbar_activate_button_text: settingsMap.navbar_activate_button_text || 'Activate SIM',
        navbar_activate_button_url: settingsMap.navbar_activate_button_url || '/activate'
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(formData)) {
        const existingSetting = settings?.find(s => s.key === key);
        
        if (existingSetting) {
          await updateSetting.mutateAsync({
            id: existingSetting.id,
            value
          });
        } else {
          await createSetting.mutateAsync({
            key,
            value,
            type: key === 'logo_url' ? 'image' : 'text',
            category: 'branding',
            description: `Branding ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Branding settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update branding settings',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Navigation & Branding</h1>
          <p className="text-muted-foreground">
            Manage your brand assets and navigation elements
          </p>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt={formData.logo_alt}
                    className="h-8 w-auto"
                  />
                ) : (
                  <div className="h-8 w-32 bg-muted rounded flex items-center justify-center text-xs">
                    Logo Placeholder
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Navigation Links</span>
                <Button size="sm" variant="default">
                  {formData.navbar_activate_button_text}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Logo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload and configure your brand logo for the navigation bar
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Logo Image</Label>
            <ImageUpload
              existingImage={formData.logo_url}
              onUploadComplete={(url) => handleInputChange('logo_url', url)}
              bucket="logos"
            />
            <p className="text-xs text-muted-foreground">
              Upload your logo (PNG, JPG, or SVG). Recommended size: 200x60px
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoAlt">Logo Alt Text</Label>
            <Input
              id="logoAlt"
              value={formData.logo_alt}
              onChange={(e) => handleInputChange('logo_alt', e.target.value)}
              placeholder="Your Brand Name"
            />
            <p className="text-xs text-muted-foreground">
              Alternative text for accessibility and SEO
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the main call-to-action button in the navigation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="navbarActivateText">CTA Button Text</Label>
              <Input
                id="navbarActivateText"
                value={formData.navbar_activate_button_text}
                onChange={(e) => handleInputChange('navbar_activate_button_text', e.target.value)}
                placeholder="Activate SIM"
              />
              <p className="text-xs text-muted-foreground">
                Text displayed on the main action button
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="navbarActivateUrl">CTA Button URL</Label>
              <Input
                id="navbarActivateUrl"
                value={formData.navbar_activate_button_url}
                onChange={(e) => handleInputChange('navbar_activate_button_url', e.target.value)}
                placeholder="/activate"
              />
              <p className="text-xs text-muted-foreground">
                URL or path for the action button
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={updateSetting.isPending || createSetting.isPending}
              className="flex items-center gap-2"
            >
              {(updateSetting.isPending || createSetting.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomepageBranding;