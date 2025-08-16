import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';

const AdminHomepageCTA = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    ctaTitle: '',
    ctaSubtitle: '',
    ctaDescription: '',
    ctaPrimaryButtonText: '',
    ctaPrimaryButtonUrl: '',
    ctaSecondaryButtonText: '',
    ctaSecondaryButtonUrl: '',
    ctaKey1: '',
    ctaKey2: '',
    ctaKey3: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        ctaTitle: settingsMap.ctaTitle || 'Ready to Get Connected?',
        ctaSubtitle: settingsMap.ctaSubtitle || 'Join thousands of satisfied customers',
        ctaDescription: settingsMap.ctaDescription || 'Start your journey with Dynamo Wireless today and experience the difference of reliable, affordable wireless service across Central America.',
        ctaPrimaryButtonText: settingsMap.ctaPrimaryButtonText || 'Get Started',
        ctaPrimaryButtonUrl: settingsMap.ctaPrimaryButtonUrl || '/plans',
        ctaSecondaryButtonText: settingsMap.ctaSecondaryButtonText || 'Contact Us',
        ctaSecondaryButtonUrl: settingsMap.ctaSecondaryButtonUrl || '/contact',
        ctaKey1: settingsMap.ctaKey1 || 'No Contract',
        ctaKey2: settingsMap.ctaKey2 || 'Quick Setup',
        ctaKey3: settingsMap.ctaKey3 || '24/7 Support'
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
            category: 'cta',
            description: `CTA section ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'CTA section updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update CTA section',
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
          <h1 className="text-2xl font-bold">CTA Section</h1>
          <p className="text-muted-foreground">
            Manage the call-to-action section that appears before the footer
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
          <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.ctaTitle}
              </h2>
              <p className="text-xl text-primary mb-2">
                {formData.ctaSubtitle}
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                {formData.ctaDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg">{formData.ctaPrimaryButtonText}</Button>
                <Button variant="outline" size="lg">{formData.ctaSecondaryButtonText}</Button>
              </div>
              
              <div className="flex justify-center space-x-8">
                {[formData.ctaKey1, formData.ctaKey2, formData.ctaKey3].map((key, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>CTA Section Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the main content for the call-to-action section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ctaTitle">Section Title</Label>
            <Input
              id="ctaTitle"
              value={formData.ctaTitle}
              onChange={(e) => handleInputChange('ctaTitle', e.target.value)}
              placeholder="Ready to Get Connected?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaSubtitle">Section Subtitle</Label>
            <Input
              id="ctaSubtitle"
              value={formData.ctaSubtitle}
              onChange={(e) => handleInputChange('ctaSubtitle', e.target.value)}
              placeholder="Join thousands of satisfied customers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaDescription">Section Description</Label>
            <Textarea
              id="ctaDescription"
              value={formData.ctaDescription}
              onChange={(e) => handleInputChange('ctaDescription', e.target.value)}
              placeholder="Start your journey with Dynamo Wireless today..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Button Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Action Buttons</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the primary and secondary call-to-action buttons
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ctaPrimaryButtonText">Primary Button Text</Label>
              <Input
                id="ctaPrimaryButtonText"
                value={formData.ctaPrimaryButtonText}
                onChange={(e) => handleInputChange('ctaPrimaryButtonText', e.target.value)}
                placeholder="Get Started"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaPrimaryButtonUrl">Primary Button URL</Label>
              <Input
                id="ctaPrimaryButtonUrl"
                value={formData.ctaPrimaryButtonUrl}
                onChange={(e) => handleInputChange('ctaPrimaryButtonUrl', e.target.value)}
                placeholder="/plans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaSecondaryButtonText">Secondary Button Text</Label>
              <Input
                id="ctaSecondaryButtonText"
                value={formData.ctaSecondaryButtonText}
                onChange={(e) => handleInputChange('ctaSecondaryButtonText', e.target.value)}
                placeholder="Contact Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaSecondaryButtonUrl">Secondary Button URL</Label>
              <Input
                id="ctaSecondaryButtonUrl"
                value={formData.ctaSecondaryButtonUrl}
                onChange={(e) => handleInputChange('ctaSecondaryButtonUrl', e.target.value)}
                placeholder="/contact"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader>
          <CardTitle>Key Selling Points</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the three key benefits displayed in the CTA section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ctaKey1">Key Point 1</Label>
              <Input
                id="ctaKey1"
                value={formData.ctaKey1}
                onChange={(e) => handleInputChange('ctaKey1', e.target.value)}
                placeholder="No Contract"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaKey2">Key Point 2</Label>
              <Input
                id="ctaKey2"
                value={formData.ctaKey2}
                onChange={(e) => handleInputChange('ctaKey2', e.target.value)}
                placeholder="Quick Setup"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaKey3">Key Point 3</Label>
              <Input
                id="ctaKey3"
                value={formData.ctaKey3}
                onChange={(e) => handleInputChange('ctaKey3', e.target.value)}
                placeholder="24/7 Support"
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

export default AdminHomepageCTA;