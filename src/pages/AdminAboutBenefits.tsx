import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutBenefits = () => {
  const settings = useAboutPageSettings();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  const [noWorriesTitle, setNoWorriesTitle] = useState(settings?.noWorriesTitle || '');
  const [noWorries, setNoWorries] = useState([
    { text: settings?.noWorry1Text || '', icon: settings?.noWorry1Icon || '' },
    { text: settings?.noWorry2Text || '', icon: settings?.noWorry2Icon || '' },
    { text: settings?.noWorry3Text || '', icon: settings?.noWorry3Icon || '' },
    { text: settings?.noWorry4Text || '', icon: settings?.noWorry4Icon || '' },
  ]);

  const iconOptions = [
    'X', 'DollarSign', 'Wifi', 'UserCheck', 'Shield', 'CheckCircle', 'XCircle', 'Ban'
  ];

  const updateNoWorry = (index: number, field: string, value: string) => {
    setNoWorries(noWorries.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    if (!siteSettings) return;

    const updates = [
      { key: 'about_no_worries_title', value: noWorriesTitle },
    ];

    noWorries.forEach((item, index) => {
      updates.push(
        { key: `about_no_worry_${index + 1}_text`, value: item.text },
        { key: `about_no_worry_${index + 1}_icon`, value: item.icon }
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
          <CardTitle>No Worries Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="no-worries-title">Section Title</Label>
            <Input
              id="no-worries-title"
              value={noWorriesTitle}
              onChange={(e) => setNoWorriesTitle(e.target.value)}
              placeholder="What you won't have to worry about."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>No Worry Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {noWorries.map((item, index) => (
              <Card key={index} className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor={`no-worry-${index}-icon`}>Icon</Label>
                    <Select 
                      value={item.icon} 
                      onValueChange={(value) => updateNoWorry(index, 'icon', value)}
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
                    <Label htmlFor={`no-worry-${index}-text`}>Text</Label>
                    <Input
                      id={`no-worry-${index}-text`}
                      value={item.text}
                      onChange={(e) => updateNoWorry(index, 'text', e.target.value)}
                      placeholder="No worry item text"
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
        {updateSetting.isPending ? 'Saving...' : 'Save Benefits Section'}
      </Button>
    </div>
  );
};

export default AdminAboutBenefits;