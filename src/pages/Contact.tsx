import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Phone, MessageCircle, Mail, MapPin, Book, Settings, HelpCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PromoBanner from '@/components/PromoBanner';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: '',
    topic: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.message) {
      toast({
        title: t('contact.fillRequired'),
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    setSubmitted(true);
    toast({
      title: t('contact.messageSent'),
      description: t('contact.messageSentDesc')
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Header */}
      <section className="py-16 hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('contact.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              {t('contact.heroSubtitle')}
            </p>
          </div>
          
          {/* Floating background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 animate-pulse">📞</div>
            <div className="absolute top-32 right-20 animate-pulse delay-300">💬</div>
            <div className="absolute bottom-20 left-20 animate-pulse delay-700">📧</div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Contact Options - Quick Access Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Call Us */}
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => window.open('tel:+18774687989')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('contact.callUs')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-2xl font-semibold text-primary">+1 (877) 468-7989</p>
                <div className="flex items-center justify-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{t('contact.hours')}</span>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  {t('contact.callNow')}
                </Button>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('contact.liveChat')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-muted-foreground">
                  {t('contact.chatHelp')}
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  {t('contact.startChat')}
                </Button>
              </CardContent>
            </Card>

            {/* Email Us */}
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => window.open('mailto:activations@dynamowireless.com')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('contact.emailUs')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-primary font-medium">activations@dynamowireless.com</p>
                <p className="text-muted-foreground text-sm">
                  {t('contact.emailResponse')}
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  {t('contact.sendEmail')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('contact.sendMessage')}</CardTitle>
              <p className="text-muted-foreground text-center">
                {t('contact.formSubtitle')}
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-green-700">{t('contact.successTitle')}</h3>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('contact.firstName')} *</Label>
                      <Input
                        id="firstName"
                        placeholder="Jane Doe"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contact.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.emailAddress')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">{t('contact.topic')}</Label>
                    <Select onValueChange={(value) => handleInputChange('topic', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contact.topic')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activation">{t('contact.topicOptions.activation')}</SelectItem>
                        <SelectItem value="billing">{t('contact.topicOptions.billing')}</SelectItem>
                        <SelectItem value="technical">{t('contact.topicOptions.technical')}</SelectItem>
                        <SelectItem value="other">{t('contact.topicOptions.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')} *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {t('contact.submitMessage')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Office Location */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('contact.visitUs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">{t('contact.ourOffice')}</h3>
                      <p className="text-muted-foreground">
                        18000 Studebaker Rd, Suite 700<br />
                        Cerritos, CA 90703
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => window.open('https://maps.google.com/?q=18000+Studebaker+Rd,+Suite+700,+Cerritos,+CA+90703')}>
                    {t('contact.getDirections')}
                  </Button>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7891234567!2d-118.08123456789!3d33.8234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z18000+Studebaker+Rd,+Suite+700,+Cerritos,+CA+90703!5e0!3m2!1sen!2sus!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '0.5rem' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Dynamo Wireless Office Location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support Center Links */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('contact.selfHelp')}</CardTitle>
              <p className="text-muted-foreground text-center">
                {t('contact.selfHelpSubtitle')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                  <Book className="w-6 h-6" />
                  <span>{t('contact.helpCenter')}</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                  <Settings className="w-6 h-6" />
                  <span>{t('contact.activationGuide')}</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
                  <HelpCircle className="w-6 h-6" />
                  <span>{t('contact.faqPage')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Friendly Message */}
        <section className="text-center py-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold mb-2">{t('contact.friendlyMessage')}</h3>
              <p className="text-muted-foreground">
                {t('contact.friendlySubtitle')}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default Contact;