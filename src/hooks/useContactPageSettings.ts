import { useSiteSettings } from './useSiteSettings';

export const useContactPageSettings = () => {
  const { data: siteSettings } = useSiteSettings();

  if (!siteSettings) return null;

  const getSettingValue = (key: string) => {
    const setting = siteSettings.find(s => s.key === key);
    return setting?.value || '';
  };

  return {
    // Hero Section
    heroTitle: getSettingValue('contact-hero-title'),
    heroSubtitle: getSettingValue('contact-hero-subtitle'),

    // Contact Options
    phoneNumber: getSettingValue('contact-phone-number'),
    phoneHours: getSettingValue('contact-phone-hours'),
    emailAddress: getSettingValue('contact-email-address'),
    emailResponseTime: getSettingValue('contact-email-response-time'),
    chatDescription: getSettingValue('contact-chat-description'),

    // Office Location
    officeTitle: getSettingValue('contact-office-title'),
    officeAddress: getSettingValue('contact-office-address'),
    officeMapUrl: getSettingValue('contact-office-map-url'),

    // Contact Form
    formTitle: getSettingValue('contact-form-title'),
    formSubtitle: getSettingValue('contact-form-subtitle'),

    // Self Help
    selfHelpTitle: getSettingValue('contact-self-help-title'),
    selfHelpSubtitle: getSettingValue('contact-self-help-subtitle'),

    // Friendly Message
    friendlyTitle: getSettingValue('contact-friendly-title'),
    friendlySubtitle: getSettingValue('contact-friendly-subtitle'),

    // Support Links
    helpCenterUrl: getSettingValue('contact-help-center-url'),
    activationGuideUrl: getSettingValue('contact-activation-guide-url'),
    faqUrl: getSettingValue('contact-faq-url'),
  };
};