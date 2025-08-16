import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Eye } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

const AdminHomepageCoverage = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();
  
  const [formData, setFormData] = useState({
    coverage_title: '',
    coverage_description: '',
    coverage_button_text: '',
    coverage_button_url: '',
    coverage_stat_1_number: '',
    coverage_stat_1_title: '',
    coverage_stat_1_desc: '',
    coverage_stat_2_number: '',
    coverage_stat_2_title: '',
    coverage_stat_2_desc: '',
    coverage_image_url: ''
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        coverage_title: settingsMap.coverage_title || 'America\'s Largest 5G Networks',
        coverage_description: settingsMap.coverage_description || 'Experience the power of our extensive 5G network coverage across Guatemala, Honduras, and El Salvador. With our advanced infrastructure, stay connected wherever your journey takes you.',
        coverage_button_text: settingsMap.coverage_button_text || 'Check Coverage',
        coverage_button_url: settingsMap.coverage_button_url || '/coverage',
        coverage_stat_1_number: settingsMap.coverage_stat_1_number || '98%',
        coverage_stat_1_title: settingsMap.coverage_stat_1_title || 'Population Coverage',
        coverage_stat_1_desc: settingsMap.coverage_stat_1_desc || 'Reliable signal where you live and work',
        coverage_stat_2_number: settingsMap.coverage_stat_2_number || '300+',
        coverage_stat_2_title: settingsMap.coverage_stat_2_title || 'Cities',
        coverage_stat_2_desc: settingsMap.coverage_stat_2_desc || '5G available in major metropolitan areas',
        coverage_image_url: settingsMap.coverage_image_url || ''
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
            type: key === 'coverage_image_url' ? 'image' : 'text',
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
          <div className="bg-white p-8 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Text Content */}
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-black">
                  {formData.coverage_title}
                </h2>
                
                <p className="text-gray-600 text-base leading-relaxed">
                  {formData.coverage_description}
                </p>
                
                {/* Statistics Cards */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formData.coverage_stat_1_number}
                    </div>
                    <div className="text-gray-900 font-medium mb-1">
                      {formData.coverage_stat_1_title}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {formData.coverage_stat_1_desc}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formData.coverage_stat_2_number}
                    </div>
                    <div className="text-gray-900 font-medium mb-1">
                      {formData.coverage_stat_2_title}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {formData.coverage_stat_2_desc}
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium">
                  {formData.coverage_button_text}
                </Button>
              </div>

              {/* Right Column - Image or Default Design */}
              <div className="flex flex-col items-center lg:items-end">
                <div className="relative mb-4">
                  {formData.coverage_image_url ? (
                    <img 
                      src={formData.coverage_image_url}
                      alt="Coverage Map"
                      className="w-96 h-72 object-cover rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="w-96 h-72 bg-primary rounded-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                      <div className="text-white text-7xl font-bold tracking-wider relative z-10">
                        5G
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/30 rounded-lg blur-2xl -z-10 scale-110"></div>
                </div>
                
                <p className="text-gray-500 text-sm text-center lg:text-right">
                  {formData.coverage_image_url ? 'Custom coverage map' : 'Image does not depict coverage'}
                </p>
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
              value={formData.coverage_title}
              onChange={(e) => handleInputChange('coverage_title', e.target.value)}
              placeholder="America's Largest 5G Networks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageDescription">Section Description</Label>
            <Textarea
              id="coverageDescription"
              value={formData.coverage_description}
              onChange={(e) => handleInputChange('coverage_description', e.target.value)}
              placeholder="Experience the power of our extensive 5G network..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="coverageButtonText">Button Text</Label>
              <Input
                id="coverageButtonText"
                value={formData.coverage_button_text}
                onChange={(e) => handleInputChange('coverage_button_text', e.target.value)}
                placeholder="Check Coverage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageButtonUrl">Button URL</Label>
              <Input
                id="coverageButtonUrl"
                value={formData.coverage_button_url}
                onChange={(e) => handleInputChange('coverage_button_url', e.target.value)}
                placeholder="/coverage"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Coverage Image</Label>
            <ImageUpload
              existingImage={formData.coverage_image_url}
              onUploadComplete={(url) => handleInputChange('coverage_image_url', url)}
              bucket="coverage"
            />
            <p className="text-xs text-muted-foreground">
              Upload a custom coverage map image. If not provided, the default 5G design will be used.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Statistics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the statistics displayed in the coverage section
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="coverageStats1Value">Statistic 1 Number</Label>
                <Input
                  id="coverageStats1Value"
                  value={formData.coverage_stat_1_number}
                  onChange={(e) => handleInputChange('coverage_stat_1_number', e.target.value)}
                  placeholder="98%"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageStats1Title">Statistic 1 Title</Label>
                <Input
                  id="coverageStats1Title"
                  value={formData.coverage_stat_1_title}
                  onChange={(e) => handleInputChange('coverage_stat_1_title', e.target.value)}
                  placeholder="Population Coverage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageStats1Desc">Statistic 1 Description</Label>
                <Input
                  id="coverageStats1Desc"
                  value={formData.coverage_stat_1_desc}
                  onChange={(e) => handleInputChange('coverage_stat_1_desc', e.target.value)}
                  placeholder="Reliable signal where you live and work"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="coverageStats2Value">Statistic 2 Number</Label>
                <Input
                  id="coverageStats2Value"
                  value={formData.coverage_stat_2_number}
                  onChange={(e) => handleInputChange('coverage_stat_2_number', e.target.value)}
                  placeholder="300+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageStats2Title">Statistic 2 Title</Label>
                <Input
                  id="coverageStats2Title"
                  value={formData.coverage_stat_2_title}
                  onChange={(e) => handleInputChange('coverage_stat_2_title', e.target.value)}
                  placeholder="Cities"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageStats2Desc">Statistic 2 Description</Label>
                <Input
                  id="coverageStats2Desc"
                  value={formData.coverage_stat_2_desc}
                  onChange={(e) => handleInputChange('coverage_stat_2_desc', e.target.value)}
                  placeholder="5G available in major metropolitan areas"
                />
              </div>
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