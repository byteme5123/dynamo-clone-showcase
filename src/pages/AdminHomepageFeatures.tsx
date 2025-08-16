import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';

const AdminHomepageFeatures = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    featuresTitle: '',
    featuresSubtitle: '',
    featuresDescription: '',
    featuresButtonText: '',
    featuresButtonUrl: '',
    featuresKey1: '',
    featuresKey2: '',
    featuresKey3: '',
    featuresKey4: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        featuresTitle: settingsMap.featuresTitle || 'Our Affordable Wireless Plans',
        featuresSubtitle: settingsMap.featuresSubtitle || 'Connecting You Across Central America',
        featuresDescription: settingsMap.featuresDescription || 'Experience unparalleled connectivity with our comprehensive wireless solutions across Guatemala, Honduras, and El Salvador.',
        featuresButtonText: settingsMap.featuresButtonText || 'View All Plans',
        featuresButtonUrl: settingsMap.featuresButtonUrl || '/plans',
        featuresKey1: settingsMap.featuresKey1 || '5G Network Coverage',
        featuresKey2: settingsMap.featuresKey2 || 'International Roaming',
        featuresKey3: settingsMap.featuresKey3 || '24/7 Customer Support',
        featuresKey4: settingsMap.featuresKey4 || 'Affordable Pricing'
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
            category: 'features',
            description: `Features section ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Features section updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update features section',
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
          <h1 className="text-2xl font-bold">Features Section</h1>
          <p className="text-muted-foreground">
            Manage the "Our Affordable Wireless Plans" section content
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.featuresTitle}
              </h2>
              <p className="text-xl text-primary mb-2">
                {formData.featuresSubtitle}
              </p>
              <p className="text-gray-600 max-w-3xl mx-auto">
                {formData.featuresDescription}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[formData.featuresKey1, formData.featuresKey2, formData.featuresKey3, formData.featuresKey4].map((key, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700">{key}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button>{formData.featuresButtonText}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Features Section Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the main heading and description for the features section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="featuresTitle">Section Title</Label>
            <Input
              id="featuresTitle"
              value={formData.featuresTitle}
              onChange={(e) => handleInputChange('featuresTitle', e.target.value)}
              placeholder="Our Affordable Wireless Plans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuresSubtitle">Section Subtitle</Label>
            <Input
              id="featuresSubtitle"
              value={formData.featuresSubtitle}
              onChange={(e) => handleInputChange('featuresSubtitle', e.target.value)}
              placeholder="Connecting You Across Central America"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuresDescription">Section Description</Label>
            <Textarea
              id="featuresDescription"
              value={formData.featuresDescription}
              onChange={(e) => handleInputChange('featuresDescription', e.target.value)}
              placeholder="Experience unparalleled connectivity..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="featuresButtonText">Button Text</Label>
              <Input
                id="featuresButtonText"
                value={formData.featuresButtonText}
                onChange={(e) => handleInputChange('featuresButtonText', e.target.value)}
                placeholder="View All Plans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuresButtonUrl">Button URL</Label>
              <Input
                id="featuresButtonUrl"
                value={formData.featuresButtonUrl}
                onChange={(e) => handleInputChange('featuresButtonUrl', e.target.value)}
                placeholder="/plans"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the four key features displayed as highlights
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="featuresKey1">Key Feature 1</Label>
              <Input
                id="featuresKey1"
                value={formData.featuresKey1}
                onChange={(e) => handleInputChange('featuresKey1', e.target.value)}
                placeholder="5G Network Coverage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuresKey2">Key Feature 2</Label>
              <Input
                id="featuresKey2"
                value={formData.featuresKey2}
                onChange={(e) => handleInputChange('featuresKey2', e.target.value)}
                placeholder="International Roaming"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuresKey3">Key Feature 3</Label>
              <Input
                id="featuresKey3"
                value={formData.featuresKey3}
                onChange={(e) => handleInputChange('featuresKey3', e.target.value)}
                placeholder="24/7 Customer Support"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuresKey4">Key Feature 4</Label>
              <Input
                id="featuresKey4"
                value={formData.featuresKey4}
                onChange={(e) => handleInputChange('featuresKey4', e.target.value)}
                placeholder="Affordable Pricing"
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

export default AdminHomepageFeatures;