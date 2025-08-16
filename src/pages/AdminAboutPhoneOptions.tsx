import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutPhoneOptions = () => {
  const settings = useAboutPageSettings();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  const [phoneOptionsTitle, setPhoneOptionsTitle] = useState(settings?.phoneOptionsTitle || '');
  
  // Bring Your Phone
  const [bringPhoneTitle, setBringPhoneTitle] = useState(settings?.bringPhoneTitle || '');
  const [bringPhoneDescription, setBringPhoneDescription] = useState(settings?.bringPhoneDescription || '');
  const [bringPhoneButtonText, setBringPhoneButtonText] = useState(settings?.bringPhoneButtonText || '');
  const [bringPhoneButtonUrl, setBringPhoneButtonUrl] = useState(settings?.bringPhoneButtonUrl || '');
  const [bringPhoneImageUrl, setBringPhoneImageUrl] = useState(settings?.bringPhoneImageUrl || '');
  
  // Buy New Phone
  const [buyPhoneTitle, setBuyPhoneTitle] = useState(settings?.buyPhoneTitle || '');
  const [buyPhoneDescription, setBuyPhoneDescription] = useState(settings?.buyPhoneDescription || '');
  const [buyPhoneButtonText, setBuyPhoneButtonText] = useState(settings?.buyPhoneButtonText || '');
  const [buyPhoneButtonUrl, setBuyPhoneButtonUrl] = useState(settings?.buyPhoneButtonUrl || '');
  const [buyPhoneImageUrl, setBuyPhoneImageUrl] = useState(settings?.buyPhoneImageUrl || '');

  const handleSave = () => {
    if (!siteSettings) return;

    const updates = [
      { key: 'about_phone_options_title', value: phoneOptionsTitle },
      { key: 'about_bring_phone_title', value: bringPhoneTitle },
      { key: 'about_bring_phone_description', value: bringPhoneDescription },
      { key: 'about_bring_phone_button_text', value: bringPhoneButtonText },
      { key: 'about_bring_phone_button_url', value: bringPhoneButtonUrl },
      { key: 'about_bring_phone_image_url', value: bringPhoneImageUrl },
      { key: 'about_buy_phone_title', value: buyPhoneTitle },
      { key: 'about_buy_phone_description', value: buyPhoneDescription },
      { key: 'about_buy_phone_button_text', value: buyPhoneButtonText },
      { key: 'about_buy_phone_button_url', value: buyPhoneButtonUrl },
      { key: 'about_buy_phone_image_url', value: buyPhoneImageUrl },
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Phone Options Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone-options-title">Section Title</Label>
            <Input
              id="phone-options-title"
              value={phoneOptionsTitle}
              onChange={(e) => setPhoneOptionsTitle(e.target.value)}
              placeholder="Bring the phone you already have or buy a new one."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bring Your Phone */}
        <Card>
          <CardHeader>
            <CardTitle>Bring Your Phone Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bring-phone-title">Title</Label>
              <Input
                id="bring-phone-title"
                value={bringPhoneTitle}
                onChange={(e) => setBringPhoneTitle(e.target.value)}
                placeholder="Bring your phone."
              />
            </div>
            
            <div>
              <Label htmlFor="bring-phone-description">Description</Label>
              <Input
                id="bring-phone-description"
                value={bringPhoneDescription}
                onChange={(e) => setBringPhoneDescription(e.target.value)}
                placeholder="Switch and keep your device. Most unlocked phones work on our network."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bring-phone-button-text">Button Text</Label>
                <Input
                  id="bring-phone-button-text"
                  value={bringPhoneButtonText}
                  onChange={(e) => setBringPhoneButtonText(e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div>
                <Label htmlFor="bring-phone-button-url">Button URL</Label>
                <Input
                  id="bring-phone-button-url"
                  value={bringPhoneButtonUrl}
                  onChange={(e) => setBringPhoneButtonUrl(e.target.value)}
                  placeholder="/activate"
                />
              </div>
            </div>
            
            <div>
              <Label>Card Image</Label>
              <ImageUpload
                bucket="seo-images"
                folder="about"
                onUploadComplete={(url) => setBringPhoneImageUrl(url)}
                existingImage={bringPhoneImageUrl}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Buy New Phone */}
        <Card>
          <CardHeader>
            <CardTitle>Buy New Phone Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="buy-phone-title">Title</Label>
              <Input
                id="buy-phone-title"
                value={buyPhoneTitle}
                onChange={(e) => setBuyPhoneTitle(e.target.value)}
                placeholder="Buy a new one."
              />
            </div>
            
            <div>
              <Label htmlFor="buy-phone-description">Description</Label>
              <Input
                id="buy-phone-description"
                value={buyPhoneDescription}
                onChange={(e) => setBuyPhoneDescription(e.target.value)}
                placeholder="Find the best device with financing options on new and pre-owned phones."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buy-phone-button-text">Button Text</Label>
                <Input
                  id="buy-phone-button-text"
                  value={buyPhoneButtonText}
                  onChange={(e) => setBuyPhoneButtonText(e.target.value)}
                  placeholder="Shop Phones"
                />
              </div>
              <div>
                <Label htmlFor="buy-phone-button-url">Button URL</Label>
                <Input
                  id="buy-phone-button-url"
                  value={buyPhoneButtonUrl}
                  onChange={(e) => setBuyPhoneButtonUrl(e.target.value)}
                  placeholder="/phones"
                />
              </div>
            </div>
            
            <div>
              <Label>Card Image</Label>
              <ImageUpload
                bucket="seo-images"
                folder="about"
                onUploadComplete={(url) => setBuyPhoneImageUrl(url)}
                existingImage={buyPhoneImageUrl}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleSave}
        disabled={updateSetting.isPending}
        className="w-full sm:w-auto"
      >
        {updateSetting.isPending ? 'Saving...' : 'Save Phone Options'}
      </Button>
    </div>
  );
};

export default AdminAboutPhoneOptions;