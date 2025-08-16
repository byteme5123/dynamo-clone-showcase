import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutFeatures = () => {
  const settings = useAboutPageSettings();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  const [featuresTitle, setFeaturesTitle] = useState(settings?.featuresTitle || '');
  const [featuresCtaText, setFeaturesCtaText] = useState(settings?.featuresCtaText || '');
  const [featuresCtaUrl, setFeaturesCtaUrl] = useState(settings?.featuresCtaUrl || '');
  
  // Feature state
  const [features, setFeatures] = useState([
    { title: settings?.feature1Title || '', description: settings?.feature1Description || '', icon: settings?.feature1Icon || '' },
    { title: settings?.feature2Title || '', description: settings?.feature2Description || '', icon: settings?.feature2Icon || '' },
    { title: settings?.feature3Title || '', description: settings?.feature3Description || '', icon: settings?.feature3Icon || '' },
    { title: settings?.feature4Title || '', description: settings?.feature4Description || '', icon: settings?.feature4Icon || '' },
    { title: settings?.feature5Title || '', description: settings?.feature5Description || '', icon: settings?.feature5Icon || '' },
    { title: settings?.feature6Title || '', description: settings?.feature6Description || '', icon: settings?.feature6Icon || '' },
  ]);

  const iconOptions = [
    'Globe', 'Signal', 'CreditCard', 'MessageSquare', 'Zap', 'Smartphone',
    'Phone', 'Mail', 'Shield', 'Star', 'Heart', 'CheckCircle', 'Users', 'Clock'
  ];

  const updateFeature = (index: number, field: string, value: string) => {
    setFeatures(features.map((feature, i) => 
      i === index ? { ...feature, [field]: value } : feature
    ));
  };

  const handleSave = () => {
    if (!siteSettings) return;

    const updates = [
      { key: 'about_features_title', value: featuresTitle },
      { key: 'about_features_cta_text', value: featuresCtaText },
      { key: 'about_features_cta_url', value: featuresCtaUrl },
    ];

    features.forEach((feature, index) => {
      updates.push(
        { key: `about_feature_${index + 1}_title`, value: feature.title },
        { key: `about_feature_${index + 1}_description`, value: feature.description },
        { key: `about_feature_${index + 1}_icon`, value: feature.icon }
      );
    });

    updates.forEach(update => {
      const setting = siteSettings.find(s => s.key === update.key);
      if (setting) {
        updateSetting.mutate({
          id: setting.id,
          value: update.value,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Features Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="features-title">Section Title</Label>
              <Input
                id="features-title"
                value={featuresTitle}
                onChange={(e) => setFeaturesTitle(e.target.value)}
                placeholder="Features you'll enjoy."
              />
            </div>
            <div>
              <Label htmlFor="features-cta-text">CTA Button Text</Label>
              <Input
                id="features-cta-text"
                value={featuresCtaText}
                onChange={(e) => setFeaturesCtaText(e.target.value)}
                placeholder="Shop Plans"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="features-cta-url">CTA Button URL</Label>
            <Input
              id="features-cta-url"
              value={featuresCtaUrl}
              onChange={(e) => setFeaturesCtaUrl(e.target.value)}
              placeholder="/plans"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Feature {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor={`feature-${index}-icon`}>Icon</Label>
                    <Select 
                      value={feature.icon} 
                      onValueChange={(value) => updateFeature(index, 'icon', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`feature-${index}-title`}>Title</Label>
                    <Input
                      id={`feature-${index}-title`}
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`feature-${index}-description`}>Description</Label>
                    <Input
                      id={`feature-${index}-description`}
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Feature description"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave}
        disabled={updateSetting.isPending}
        className="w-full sm:w-auto"
      >
        {updateSetting.isPending ? 'Saving...' : 'Save All Features'}
      </Button>
    </div>
  );
};

export default AdminAboutFeatures;