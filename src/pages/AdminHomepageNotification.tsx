import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';

const AdminHomepageNotification = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    notificationText: '',
    notificationAccountText: '',
    notificationAccountLink: '',
    notificationActivateText: '',
    notificationActivateLink: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        notificationText: settingsMap.notificationText || 'Get up to 25% off when you purchase a 3 month plan!',
        notificationAccountText: settingsMap.notificationAccountText || 'My Account',
        notificationAccountLink: settingsMap.notificationAccountLink || '/account',
        notificationActivateText: settingsMap.notificationActivateText || 'Activate',
        notificationActivateLink: settingsMap.notificationActivateLink || '/activate'
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
            type: 'text',
            category: 'notification',
            description: `Notification bar ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Notification bar settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification bar settings',
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
          <h1 className="text-2xl font-bold">Notification Bar</h1>
          <p className="text-muted-foreground">
            Manage the notification banner that appears above the navigation bar
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
          <div className="notification-bar h-10 px-4 flex items-center justify-between text-sm bg-primary text-primary-foreground rounded">
            <div className="text-white">
              {formData.notificationText}
            </div>
            <div className="hidden md:flex space-x-4">
              <span className="text-white hover:underline cursor-pointer">
                {formData.notificationAccountText}
              </span>
              <span className="text-white hover:underline cursor-pointer">
                {formData.notificationActivateText}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Bar Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the text and links that appear in the notification bar
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notificationText">Notification Message</Label>
            <Textarea
              id="notificationText"
              value={formData.notificationText}
              onChange={(e) => handleInputChange('notificationText', e.target.value)}
              placeholder="Enter the main notification message"
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              The main promotional message displayed on the left side
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notificationAccountText">Account Link Text</Label>
              <Input
                id="notificationAccountText"
                value={formData.notificationAccountText}
                onChange={(e) => handleInputChange('notificationAccountText', e.target.value)}
                placeholder="My Account"
              />
              <p className="text-xs text-muted-foreground">
                Text for the first link (usually account-related)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationAccountLink">Account Link URL</Label>
              <Input
                id="notificationAccountLink"
                value={formData.notificationAccountLink}
                onChange={(e) => handleInputChange('notificationAccountLink', e.target.value)}
                placeholder="/account"
              />
              <p className="text-xs text-muted-foreground">
                URL or path for the account link
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notificationActivateText">Activate Link Text</Label>
              <Input
                id="notificationActivateText"
                value={formData.notificationActivateText}
                onChange={(e) => handleInputChange('notificationActivateText', e.target.value)}
                placeholder="Activate"
              />
              <p className="text-xs text-muted-foreground">
                Text for the second link (usually activation-related)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationActivateLink">Activate Link URL</Label>
              <Input
                id="notificationActivateLink"
                value={formData.notificationActivateLink}
                onChange={(e) => handleInputChange('notificationActivateLink', e.target.value)}
                placeholder="/activate"
              />
              <p className="text-xs text-muted-foreground">
                URL or path for the activation link
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

export default AdminHomepageNotification;