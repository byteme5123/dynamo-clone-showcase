import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';

const AdminHomepageFooter = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    footer_description: '',
    footer_email: '',
    footer_phone: '',
    footer_address: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    footer_copyright: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        footer_description: settingsMap.footer_description || 'Dynamo Wireless provides reliable and affordable wireless services across Central America. Stay connected with our comprehensive coverage and exceptional customer service.',
        footer_email: settingsMap.footer_email || 'info@dynamowireless.com',
        footer_phone: settingsMap.footer_phone || '+1 (555) 123-4567',
        footer_address: settingsMap.footer_address || 'Guatemala City, Guatemala',
        facebook_url: settingsMap.facebook_url || 'https://facebook.com/dynamowireless',
        twitter_url: settingsMap.twitter_url || 'https://twitter.com/dynamowireless',
        instagram_url: settingsMap.instagram_url || 'https://instagram.com/dynamowireless',
        linkedin_url: settingsMap.linkedin_url || 'https://linkedin.com/company/dynamowireless',
        footer_copyright: settingsMap.footer_copyright || '© 2025 Dynamo Wireless. All rights reserved.'
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
            category: 'footer',
            description: `Footer ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Footer settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update footer settings',
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
          <h1 className="text-2xl font-bold">Footer Settings</h1>
          <p className="text-muted-foreground">
            Manage footer content, contact information, and social media links
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
          <div className="bg-gray-900 text-white p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="font-bold text-lg mb-4">Dynamo Wireless</h3>
                <p className="text-gray-300 text-sm mb-4">{formData.footer_description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Contact Info</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>{formData.footer_email}</p>
                  <p>{formData.footer_phone}</p>
                  <p>{formData.footer_address}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                  <div className="w-8 h-8 bg-blue-400 rounded"></div>
                  <div className="w-8 h-8 bg-pink-600 rounded"></div>
                  <div className="w-8 h-8 bg-blue-700 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              {formData.footer_copyright}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your company description and basic information
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="footerDescription">Company Description</Label>
            <Textarea
              id="footerDescription"
              value={formData.footer_description}
              onChange={(e) => handleInputChange('footer_description', e.target.value)}
              placeholder="Dynamo Wireless provides reliable and affordable wireless services..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Brief description of your company that appears in the footer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerCopyright">Copyright Text</Label>
            <Input
              id="footerCopyright"
              value={formData.footer_copyright}
              onChange={(e) => handleInputChange('footer_copyright', e.target.value)}
              placeholder="© 2024 Dynamo Wireless. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the contact details displayed in the footer
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="footerEmail">Email Address</Label>
              <Input
                id="footerEmail"
                type="email"
                value={formData.footer_email}
                onChange={(e) => handleInputChange('footer_email', e.target.value)}
                placeholder="info@dynamowireless.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerPhone">Phone Number</Label>
              <Input
                id="footerPhone"
                value={formData.footer_phone}
                onChange={(e) => handleInputChange('footer_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerAddress">Business Address</Label>
            <Input
              id="footerAddress"
              value={formData.footer_address}
              onChange={(e) => handleInputChange('footer_address', e.target.value)}
              placeholder="Guatemala City, Guatemala"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your social media presence
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="footerSocialFacebook">Facebook URL</Label>
              <Input
                id="footerSocialFacebook"
                value={formData.facebook_url}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/dynamowireless"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerSocialTwitter">Twitter URL</Label>
              <Input
                id="footerSocialTwitter"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/dynamowireless"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerSocialInstagram">Instagram URL</Label>
              <Input
                id="footerSocialInstagram"
                value={formData.instagram_url}
                onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/dynamowireless"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerSocialLinkedin">LinkedIn URL</Label>
              <Input
                id="footerSocialLinkedin"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/dynamowireless"
              />
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

export default AdminHomepageFooter;