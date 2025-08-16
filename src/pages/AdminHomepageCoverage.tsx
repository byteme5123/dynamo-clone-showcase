import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';

const AdminHomepageCoverage = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    coverageTitle: '',
    coverageSubtitle: '',
    coverageDescription: '',
    coverageButtonText: '',
    coverageButtonUrl: '',
    coverageStats1Label: '',
    coverageStats1Value: '',
    coverageStats2Label: '',
    coverageStats2Value: '',
    coverageStats3Label: '',
    coverageStats3Value: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        coverageTitle: settingsMap.coverageTitle || 'America\'s Largest 5G Networks',
        coverageSubtitle: settingsMap.coverageSubtitle || 'Nationwide Coverage You Can Trust',
        coverageDescription: settingsMap.coverageDescription || 'Experience the power of our extensive 5G network coverage across Guatemala, Honduras, and El Salvador. With our advanced infrastructure, stay connected wherever your journey takes you.',
        coverageButtonText: settingsMap.coverageButtonText || 'Check Coverage',
        coverageButtonUrl: settingsMap.coverageButtonUrl || '/coverage',
        coverageStats1Label: settingsMap.coverageStats1Label || 'Cities Covered',
        coverageStats1Value: settingsMap.coverageStats1Value || '500+',
        coverageStats2Label: settingsMap.coverageStats2Label || 'Network Uptime',
        coverageStats2Value: settingsMap.coverageStats2Value || '99.9%',
        coverageStats3Label: settingsMap.coverageStats3Label || 'Happy Customers',
        coverageStats3Value: settingsMap.coverageStats3Value || '1M+'
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
            category: 'coverage',
            description: `Coverage section ${key} setting`
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Coverage section updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coverage section',
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
          <h1 className="text-2xl font-bold">Coverage Section</h1>
          <p className="text-muted-foreground">
            Manage the "America's Largest 5G Networks" section content
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.coverageTitle}
              </h2>
              <p className="text-xl text-primary mb-2">
                {formData.coverageSubtitle}
              </p>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                {formData.coverageDescription}
              </p>
              <Button>{formData.coverageButtonText}</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formData.coverageStats1Value}
                </div>
                <p className="text-gray-600">{formData.coverageStats1Label}</p>
              </div>
              <div className="text-center bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formData.coverageStats2Value}
                </div>
                <p className="text-gray-600">{formData.coverageStats2Label}</p>
              </div>
              <div className="text-center bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formData.coverageStats3Value}
                </div>
                <p className="text-gray-600">{formData.coverageStats3Label}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Section Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the main heading and description for the coverage section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="coverageTitle">Section Title</Label>
            <Input
              id="coverageTitle"
              value={formData.coverageTitle}
              onChange={(e) => handleInputChange('coverageTitle', e.target.value)}
              placeholder="America's Largest 5G Networks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageSubtitle">Section Subtitle</Label>
            <Input
              id="coverageSubtitle"
              value={formData.coverageSubtitle}
              onChange={(e) => handleInputChange('coverageSubtitle', e.target.value)}
              placeholder="Nationwide Coverage You Can Trust"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageDescription">Section Description</Label>
            <Textarea
              id="coverageDescription"
              value={formData.coverageDescription}
              onChange={(e) => handleInputChange('coverageDescription', e.target.value)}
              placeholder="Experience the power of our extensive 5G network..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="coverageButtonText">Button Text</Label>
              <Input
                id="coverageButtonText"
                value={formData.coverageButtonText}
                onChange={(e) => handleInputChange('coverageButtonText', e.target.value)}
                placeholder="Check Coverage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageButtonUrl">Button URL</Label>
              <Input
                id="coverageButtonUrl"
                value={formData.coverageButtonUrl}
                onChange={(e) => handleInputChange('coverageButtonUrl', e.target.value)}
                placeholder="/coverage"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Statistics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the three key statistics displayed in the coverage section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="coverageStats1Value">Statistic 1 Value</Label>
              <Input
                id="coverageStats1Value"
                value={formData.coverageStats1Value}
                onChange={(e) => handleInputChange('coverageStats1Value', e.target.value)}
                placeholder="500+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageStats1Label">Statistic 1 Label</Label>
              <Input
                id="coverageStats1Label"
                value={formData.coverageStats1Label}
                onChange={(e) => handleInputChange('coverageStats1Label', e.target.value)}
                placeholder="Cities Covered"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageStats2Value">Statistic 2 Value</Label>
              <Input
                id="coverageStats2Value"
                value={formData.coverageStats2Value}
                onChange={(e) => handleInputChange('coverageStats2Value', e.target.value)}
                placeholder="99.9%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageStats2Label">Statistic 2 Label</Label>
              <Input
                id="coverageStats2Label"
                value={formData.coverageStats2Label}
                onChange={(e) => handleInputChange('coverageStats2Label', e.target.value)}
                placeholder="Network Uptime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageStats3Value">Statistic 3 Value</Label>
              <Input
                id="coverageStats3Value"
                value={formData.coverageStats3Value}
                onChange={(e) => handleInputChange('coverageStats3Value', e.target.value)}
                placeholder="1M+"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageStats3Label">Statistic 3 Label</Label>
              <Input
                id="coverageStats3Label"
                value={formData.coverageStats3Label}
                onChange={(e) => handleInputChange('coverageStats3Label', e.target.value)}
                placeholder="Happy Customers"
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

export default AdminHomepageCoverage;