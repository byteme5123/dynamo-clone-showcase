import { useSiteSettings } from '@/hooks/useSiteSettings';

export const useHomepageSettings = () => {
  const { data: settings } = useSiteSettings();
  
  if (!settings) return null;

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  return {
    // Branding
    navbarLogo: getSettingValue('logo_url'),
    footerLogo: getSettingValue('footer_logo_url'),
    
    // Notification bar
    notificationText: getSettingValue('notification_bar_text'),
    notificationAccountLink: getSettingValue('notification_bar_account_link'),
    notificationActivateLink: getSettingValue('notification_bar_activate_link'),
    notificationAccountText: getSettingValue('notification_bar_account_text'),
    notificationActivateText: getSettingValue('notification_bar_activate_text'),
    
    // Features section
    featuresTitle: getSettingValue('features_title'),
    feature1Title: getSettingValue('feature_1_title'),
    feature2Title: getSettingValue('feature_2_title'),
    feature3Title: getSettingValue('feature_3_title'),
    feature4Title: getSettingValue('feature_4_title'),
    feature5Title: getSettingValue('feature_5_title'),
    
    // Coverage section
    coverageTitle: getSettingValue('coverage_title'),
    coverageDescription: getSettingValue('coverage_description'),
    coverageStat1Number: getSettingValue('coverage_stat_1_number'),
    coverageStat1Title: getSettingValue('coverage_stat_1_title'),
    coverageStat1Desc: getSettingValue('coverage_stat_1_desc'),
    coverageStat2Number: getSettingValue('coverage_stat_2_number'),
    coverageStat2Title: getSettingValue('coverage_stat_2_title'),
    coverageStat2Desc: getSettingValue('coverage_stat_2_desc'),
    coverageButtonText: getSettingValue('coverage_button_text'),
    coverageButtonUrl: getSettingValue('coverage_button_url'),
    coverageImageUrl: getSettingValue('coverage_image_url'),
    
    // CTA section
    ctaTitle: getSettingValue('cta_title'),
    ctaSubtitle: getSettingValue('cta_subtitle'),
    ctaPoint1Number: getSettingValue('cta_point_1_number'),
    ctaPoint1Label: getSettingValue('cta_point_1_label'),
    ctaPoint2Number: getSettingValue('cta_point_2_number'),
    ctaPoint2Label: getSettingValue('cta_point_2_label'),
    ctaPoint3Number: getSettingValue('cta_point_3_number'),
    ctaPoint3Label: getSettingValue('cta_point_3_label'),
    ctaPrimaryButtonText: getSettingValue('cta_primary_button_text'),
    ctaPrimaryButtonUrl: getSettingValue('cta_primary_button_url'),
    ctaSecondaryButtonText: getSettingValue('cta_secondary_button_text'),
    ctaSecondaryButtonUrl: getSettingValue('cta_secondary_button_url'),
    
    // Navbar
    navbarActivateButtonText: getSettingValue('navbar_activate_button_text'),
    navbarActivateButtonUrl: getSettingValue('navbar_activate_button_url'),
    
    // Footer
    footerDescription: getSettingValue('footer_description'),
    footerPhone: getSettingValue('footer_phone'),
    footerEmail: getSettingValue('footer_email'),
    footerFacebookUrl: getSettingValue('facebook_url'),
    footerTwitterUrl: getSettingValue('twitter_url'),
    footerInstagramUrl: getSettingValue('instagram_url'),
    footerLinkedinUrl: getSettingValue('linkedin_url'),
  };
};

// These functions are no longer needed as we use dedicated hooks
// export const useHomepageTestimonials = () => {
//   return useSiteSettings();
// };

// export const useHomepageFAQs = () => {
//   return useSiteSettings();
// };