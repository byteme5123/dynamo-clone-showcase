import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettingByKey, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutIntro = () => {
  const settings = useAboutPageSettings();
  const { data: introSetting } = useSiteSettingByKey('about_intro_text');
  const updateSetting = useUpdateSiteSetting();
  
  const [introText, setIntroText] = useState(settings?.introText || '');

  const handleSave = () => {
    if (introSetting) {
      updateSetting.mutate({
        id: introSetting.id,
        value: introText,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Introduction Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="intro-text">Introduction Text</Label>
          <Textarea
            id="intro-text"
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="Enter the main introduction text that appears after the hero section"
            rows={4}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            This text appears as the main introduction below the hero section.
          </p>
        </div>

        <Button 
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="w-full sm:w-auto"
        >
          {updateSetting.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminAboutIntro;