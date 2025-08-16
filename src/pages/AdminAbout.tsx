import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AdminAboutIntro from '@/pages/AdminAboutIntro';
import AdminAboutFeatures from '@/pages/AdminAboutFeatures';
import AdminAboutBenefits from '@/pages/AdminAboutBenefits';
import AdminAboutInternational from '@/pages/AdminAboutInternational';
import AdminAboutPhoneOptions from '@/pages/AdminAboutPhoneOptions';
import AdminAboutStoreFinder from '@/pages/AdminAboutStoreFinder';

const AdminAbout = () => {
  const [activeTab, setActiveTab] = useState('intro');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Us Page Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="intro">Intro</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="international">International</TabsTrigger>
              <TabsTrigger value="phone-options">Phone Options</TabsTrigger>
              <TabsTrigger value="store-finder">Store Finder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="intro" className="space-y-4">
              <AdminAboutIntro />
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <AdminAboutFeatures />
            </TabsContent>
            
            <TabsContent value="benefits" className="space-y-4">
              <AdminAboutBenefits />
            </TabsContent>
            
            <TabsContent value="international" className="space-y-4">
              <AdminAboutInternational />
            </TabsContent>
            
            <TabsContent value="phone-options" className="space-y-4">
              <AdminAboutPhoneOptions />
            </TabsContent>
            
            <TabsContent value="store-finder" className="space-y-4">
              <AdminAboutStoreFinder />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAbout;