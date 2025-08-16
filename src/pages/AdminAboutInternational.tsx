import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutInternational = () => {
  const settings = useAboutPageSettings();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  const [internationalTitle, setInternationalTitle] = useState(settings?.internationalTitle || '');
  const [internationalDescription, setInternationalDescription] = useState(settings?.internationalDescription || '');
  const [internationalDestinationsText, setInternationalDestinationsText] = useState(settings?.internationalDestinationsText || '');

  const handleSave = () => {
    if (!siteSettings) return;

    const updates = [
      { key: 'about_international_title', value: internationalTitle },
      { key: 'about_international_description', value: internationalDescription },
      { key: 'about_international_destinations_text', value: internationalDestinationsText },
    ];

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
    <Card>
      <CardHeader>
        <CardTitle>International Calling Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="international-title">Section Title</Label>
          <Input
            id="international-title"
            value={internationalTitle}
            onChange={(e) => setInternationalTitle(e.target.value)}
            placeholder="International calling capabilities."
          />
          <p className="text-sm text-muted-foreground mt-1">
            The main heading for the international calling section.
          </p>
        </div>

        <div>
          <Label htmlFor="international-description">Description</Label>
          <Textarea
            id="international-description"
            value={internationalDescription}
            onChange={(e) => setInternationalDescription(e.target.value)}
            placeholder="Unlimited international calling to over 100 destinations is included in most plans."
            rows={2}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Description text that appears below the title.
          </p>
        </div>

        <div>
          <Label htmlFor="destinations-text">Destinations List</Label>
          <Textarea
            id="destinations-text"
            value={internationalDestinationsText}
            onChange={(e) => setInternationalDestinationsText(e.target.value)}
            placeholder="Popular destinations include: Mexico, Canada, India, China, Philippines..."
            rows={4}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Text that appears when users click to see the list of destinations.
          </p>
        </div>

        <Button 
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="w-full sm:w-auto"
        >
          {updateSetting.isPending ? 'Saving...' : 'Save International Section'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminAboutInternational;