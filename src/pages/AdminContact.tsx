import { useState, useEffect } from 'react';
import { useContactPageSettings } from '@/hooks/useContactPageSettings';
import { useSiteSettings, useCreateSiteSetting, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const AdminContact = () => {
  const contactSettings = useContactPageSettings();
  const { data: allSettings } = useSiteSettings();
  const createSetting = useCreateSiteSetting();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    'contact-hero-title': '',
    'contact-hero-subtitle': '',
    'contact-phone-number': '',
    'contact-phone-hours': '',
    'contact-email-address': '',
    'contact-email-response-time': '',
    'contact-chat-description': '',
    'contact-office-title': '',
    'contact-office-address': '',
    'contact-office-map-url': '',
    'contact-form-title': '',
    'contact-form-subtitle': '',
    'contact-self-help-title': '',
    'contact-self-help-subtitle': '',
    'contact-friendly-title': '',
    'contact-friendly-subtitle': '',
    'contact-help-center-url': '',
    'contact-activation-guide-url': '',
    'contact-faq-url': '',
  });

  // Initialize form data when settings load
  useEffect(() => {
    if (contactSettings) {
      setFormData({
        'contact-hero-title': contactSettings.heroTitle,
        'contact-hero-subtitle': contactSettings.heroSubtitle,
        'contact-phone-number': contactSettings.phoneNumber,
        'contact-phone-hours': contactSettings.phoneHours,
        'contact-email-address': contactSettings.emailAddress,
        'contact-email-response-time': contactSettings.emailResponseTime,
        'contact-chat-description': contactSettings.chatDescription,
        'contact-office-title': contactSettings.officeTitle,
        'contact-office-address': contactSettings.officeAddress,
        'contact-office-map-url': contactSettings.officeMapUrl,
        'contact-form-title': contactSettings.formTitle,
        'contact-form-subtitle': contactSettings.formSubtitle,
        'contact-self-help-title': contactSettings.selfHelpTitle,
        'contact-self-help-subtitle': contactSettings.selfHelpSubtitle,
        'contact-friendly-title': contactSettings.friendlyTitle,
        'contact-friendly-subtitle': contactSettings.friendlySubtitle,
        'contact-help-center-url': contactSettings.helpCenterUrl,
        'contact-activation-guide-url': contactSettings.activationGuideUrl,
        'contact-faq-url': contactSettings.faqUrl,
      });
    }
  }, [contactSettings]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const promises = Object.entries(formData).map(([key, value]) => {
        const existingSetting = allSettings?.find(s => s.key === key);
        
        if (existingSetting) {
          return updateSetting.mutateAsync({
            id: existingSetting.id,
            value
          });
        } else {
          const settingTypes: { [key: string]: string } = {
            'contact-hero-subtitle': 'textarea',
            'contact-office-address': 'textarea',
            'contact-email-address': 'email',
            'contact-office-map-url': 'url',
            'contact-help-center-url': 'url',
            'contact-activation-guide-url': 'url',
            'contact-faq-url': 'url',
          };

          return createSetting.mutateAsync({
            key,
            value,
            type: settingTypes[key] || 'text',
            category: 'contact',
            description: `Contact page setting: ${key.replace('contact-', '').replace('-', ' ')}`
          });
        }
      });

      await Promise.all(promises);
      
      toast({
        title: "Settings Updated",
        description: "Contact page settings have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact page settings.",
        variant: "destructive",
      });
    }
  };

  if (!contactSettings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Page Management</h1>
        <p className="text-muted-foreground">
          Manage all content and settings for the Contact Us page.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={formData['contact-hero-title']}
                onChange={(e) => handleInputChange('contact-hero-title', e.target.value)}
                placeholder="Get in Touch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Textarea
                id="hero-subtitle"
                value={formData['contact-hero-subtitle']}
                onChange={(e) => handleInputChange('contact-hero-subtitle', e.target.value)}
                placeholder="We're here to help you get connected..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  value={formData['contact-phone-number']}
                  onChange={(e) => handleInputChange('contact-phone-number', e.target.value)}
                  placeholder="+1 (877) 468-7989"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-hours">Business Hours</Label>
                <Input
                  id="phone-hours"
                  value={formData['contact-phone-hours']}
                  onChange={(e) => handleInputChange('contact-phone-hours', e.target.value)}
                  placeholder="Mon-Fri 8AM-6PM PST"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  type="email"
                  value={formData['contact-email-address']}
                  onChange={(e) => handleInputChange('contact-email-address', e.target.value)}
                  placeholder="activations@dynamowireless.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-response">Email Response Time</Label>
                <Input
                  id="email-response"
                  value={formData['contact-email-response-time']}
                  onChange={(e) => handleInputChange('contact-email-response-time', e.target.value)}
                  placeholder="We typically respond within 24 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-description">Live Chat Description</Label>
              <Input
                id="chat-description"
                value={formData['contact-chat-description']}
                onChange={(e) => handleInputChange('contact-chat-description', e.target.value)}
                placeholder="Get instant help with our live chat support"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Form Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={formData['contact-form-title']}
                  onChange={(e) => handleInputChange('contact-form-title', e.target.value)}
                  placeholder="Send us a Message"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-subtitle">Form Subtitle</Label>
                <Input
                  id="form-subtitle"
                  value={formData['contact-form-subtitle']}
                  onChange={(e) => handleInputChange('contact-form-subtitle', e.target.value)}
                  placeholder="Fill out the form below..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Location */}
        <Card>
          <CardHeader>
            <CardTitle>Office Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="office-title">Office Title</Label>
              <Input
                id="office-title"
                value={formData['contact-office-title']}
                onChange={(e) => handleInputChange('contact-office-title', e.target.value)}
                placeholder="Visit Our Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-address">Office Address</Label>
              <Textarea
                id="office-address"
                value={formData['contact-office-address']}
                onChange={(e) => handleInputChange('contact-office-address', e.target.value)}
                placeholder="18000 Studebaker Rd, Suite 700&#10;Cerritos, CA 90703"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-map-url">Google Maps Embed URL</Label>
              <Input
                id="office-map-url"
                value={formData['contact-office-map-url']}
                onChange={(e) => handleInputChange('contact-office-map-url', e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Self Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Self-Service Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="self-help-title">Section Title</Label>
                <Input
                  id="self-help-title"
                  value={formData['contact-self-help-title']}
                  onChange={(e) => handleInputChange('contact-self-help-title', e.target.value)}
                  placeholder="Self-Service Options"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="self-help-subtitle">Section Subtitle</Label>
                <Input
                  id="self-help-subtitle"
                  value={formData['contact-self-help-subtitle']}
                  onChange={(e) => handleInputChange('contact-self-help-subtitle', e.target.value)}
                  placeholder="Find answers quickly..."
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="help-center-url">Help Center URL</Label>
                <Input
                  id="help-center-url"
                  value={formData['contact-help-center-url']}
                  onChange={(e) => handleInputChange('contact-help-center-url', e.target.value)}
                  placeholder="/help"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activation-guide-url">Activation Guide URL</Label>
                <Input
                  id="activation-guide-url"
                  value={formData['contact-activation-guide-url']}
                  onChange={(e) => handleInputChange('contact-activation-guide-url', e.target.value)}
                  placeholder="/activate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-url">FAQ Page URL</Label>
                <Input
                  id="faq-url"
                  value={formData['contact-faq-url']}
                  onChange={(e) => handleInputChange('contact-faq-url', e.target.value)}
                  placeholder="#faqs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friendly Message */}
        <Card>
          <CardHeader>
            <CardTitle>Friendly Message Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="friendly-title">Message Title</Label>
                <Input
                  id="friendly-title"
                  value={formData['contact-friendly-title']}
                  onChange={(e) => handleInputChange('contact-friendly-title', e.target.value)}
                  placeholder="We're Here to Help!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="friendly-subtitle">Message Subtitle</Label>
                <Input
                  id="friendly-subtitle"
                  value={formData['contact-friendly-subtitle']}
                  onChange={(e) => handleInputChange('contact-friendly-subtitle', e.target.value)}
                  placeholder="Our team is dedicated to providing you..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            size="lg"
            disabled={createSetting.isPending || updateSetting.isPending}
          >
            {createSetting.isPending || updateSetting.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;