import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

const AdminAboutStoreFinder = () => {
  const settings = useAboutPageSettings();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  const [storeFinderTitle, setStoreFinderTitle] = useState(settings?.storeFinderTitle || '');
  
  // Shop Online
  const [shopOnlineImageUrl, setShopOnlineImageUrl] = useState(settings?.shopOnlineImageUrl || '');
  const [shopOnlineButtonText, setShopOnlineButtonText] = useState(settings?.shopOnlineButtonText || '');
  const [shopOnlineButtonUrl, setShopOnlineButtonUrl] = useState(settings?.shopOnlineButtonUrl || '');
  
  // Find Store
  const [findStoreImageUrl, setFindStoreImageUrl] = useState(settings?.findStoreImageUrl || '');
  const [findStoreButtonText, setFindStoreButtonText] = useState(settings?.findStoreButtonText || '');
  const [findStoreButtonUrl, setFindStoreButtonUrl] = useState(settings?.findStoreButtonUrl || '');

  const handleSave = () => {
    if (!siteSettings) return;

    const updates = [
      { key: 'about_store_finder_title', value: storeFinderTitle },
      { key: 'about_shop_online_image_url', value: shopOnlineImageUrl },
      { key: 'about_shop_online_button_text', value: shopOnlineButtonText },
      { key: 'about_shop_online_button_url', value: shopOnlineButtonUrl },
      { key: 'about_find_store_image_url', value: findStoreImageUrl },
      { key: 'about_find_store_button_text', value: findStoreButtonText },
      { key: 'about_find_store_button_url', value: findStoreButtonUrl },
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
          <CardTitle>Store Finder Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="store-finder-title">Section Title</Label>
            <Input
              id="store-finder-title"
              value={storeFinderTitle}
              onChange={(e) => setStoreFinderTitle(e.target.value)}
              placeholder="Shop online or find your nearest store."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Online */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Online Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Shop Online Image</Label>
              <ImageUpload
                bucket="seo-images"
                folder="about"
                onUploadComplete={(url) => setShopOnlineImageUrl(url)}
                existingImage={shopOnlineImageUrl}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shop-online-button-text">Button Text</Label>
                <Input
                  id="shop-online-button-text"
                  value={shopOnlineButtonText}
                  onChange={(e) => setShopOnlineButtonText(e.target.value)}
                  placeholder="Shop Online"
                />
              </div>
              <div>
                <Label htmlFor="shop-online-button-url">Button URL</Label>
                <Input
                  id="shop-online-button-url"
                  value={shopOnlineButtonUrl}
                  onChange={(e) => setShopOnlineButtonUrl(e.target.value)}
                  placeholder="/plans"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Find Store */}
        <Card>
          <CardHeader>
            <CardTitle>Find Store Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Find Store Image</Label>
              <ImageUpload
                bucket="seo-images"
                folder="about"
                onUploadComplete={(url) => setFindStoreImageUrl(url)}
                existingImage={findStoreImageUrl}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="find-store-button-text">Button Text</Label>
                <Input
                  id="find-store-button-text"
                  value={findStoreButtonText}
                  onChange={(e) => setFindStoreButtonText(e.target.value)}
                  placeholder="Find a Store"
                />
              </div>
              <div>
                <Label htmlFor="find-store-button-url">Button URL</Label>
                <Input
                  id="find-store-button-url"
                  value={findStoreButtonUrl}
                  onChange={(e) => setFindStoreButtonUrl(e.target.value)}
                  placeholder="/stores"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleSave}
        disabled={updateSetting.isPending}
        className="w-full sm:w-auto"
      >
        {updateSetting.isPending ? 'Saving...' : 'Save Store Finder Section'}
      </Button>
    </div>
  );
};

export default AdminAboutStoreFinder;