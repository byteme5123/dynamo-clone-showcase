import { useSiteSettings } from './useSiteSettings';

export const useAboutPageSettings = () => {
  const { data: siteSettings } = useSiteSettings();

  if (!siteSettings) return null;

  const getSettingValue = (key: string) => {
    const setting = siteSettings.find(s => s.key === key);
    return setting?.value || null;
  };

  return {
    // Intro Section
    introText: getSettingValue('about_intro_text'),
    
    // Features Section
    featuresTitle: getSettingValue('about_features_title'),
    featuresCtaText: getSettingValue('about_features_cta_text'),
    featuresCtaUrl: getSettingValue('about_features_cta_url'),
    
    // Feature Cards
    feature1Title: getSettingValue('about_feature_1_title'),
    feature1Description: getSettingValue('about_feature_1_description'),
    feature1Icon: getSettingValue('about_feature_1_icon'),
    
    feature2Title: getSettingValue('about_feature_2_title'),
    feature2Description: getSettingValue('about_feature_2_description'),
    feature2Icon: getSettingValue('about_feature_2_icon'),
    
    feature3Title: getSettingValue('about_feature_3_title'),
    feature3Description: getSettingValue('about_feature_3_description'),
    feature3Icon: getSettingValue('about_feature_3_icon'),
    
    feature4Title: getSettingValue('about_feature_4_title'),
    feature4Description: getSettingValue('about_feature_4_description'),
    feature4Icon: getSettingValue('about_feature_4_icon'),
    
    feature5Title: getSettingValue('about_feature_5_title'),
    feature5Description: getSettingValue('about_feature_5_description'),
    feature5Icon: getSettingValue('about_feature_5_icon'),
    
    feature6Title: getSettingValue('about_feature_6_title'),
    feature6Description: getSettingValue('about_feature_6_description'),
    feature6Icon: getSettingValue('about_feature_6_icon'),
    
    // No Worries Section
    noWorriesTitle: getSettingValue('about_no_worries_title'),
    noWorry1Text: getSettingValue('about_no_worry_1_text'),
    noWorry1Icon: getSettingValue('about_no_worry_1_icon'),
    noWorry2Text: getSettingValue('about_no_worry_2_text'),
    noWorry2Icon: getSettingValue('about_no_worry_2_icon'),
    noWorry3Text: getSettingValue('about_no_worry_3_text'),
    noWorry3Icon: getSettingValue('about_no_worry_3_icon'),
    noWorry4Text: getSettingValue('about_no_worry_4_text'),
    noWorry4Icon: getSettingValue('about_no_worry_4_icon'),
    
    // International Section
    internationalTitle: getSettingValue('about_international_title'),
    internationalDescription: getSettingValue('about_international_description'),
    internationalDestinationsText: getSettingValue('about_international_destinations_text'),
    
    // Phone Options Section
    phoneOptionsTitle: getSettingValue('about_phone_options_title'),
    bringPhoneTitle: getSettingValue('about_bring_phone_title'),
    bringPhoneDescription: getSettingValue('about_bring_phone_description'),
    bringPhoneButtonText: getSettingValue('about_bring_phone_button_text'),
    bringPhoneButtonUrl: getSettingValue('about_bring_phone_button_url'),
    bringPhoneImageUrl: getSettingValue('about_bring_phone_image_url'),
    
    buyPhoneTitle: getSettingValue('about_buy_phone_title'),
    buyPhoneDescription: getSettingValue('about_buy_phone_description'),
    buyPhoneButtonText: getSettingValue('about_buy_phone_button_text'),
    buyPhoneButtonUrl: getSettingValue('about_buy_phone_button_url'),
    buyPhoneImageUrl: getSettingValue('about_buy_phone_image_url'),
    
    // Store Finder Section
    storeFinderTitle: getSettingValue('about_store_finder_title'),
    shopOnlineImageUrl: getSettingValue('about_shop_online_image_url'),
    shopOnlineButtonText: getSettingValue('about_shop_online_button_text'),
    shopOnlineButtonUrl: getSettingValue('about_shop_online_button_url'),
    findStoreImageUrl: getSettingValue('about_find_store_image_url'),
    findStoreButtonText: getSettingValue('about_find_store_button_text'),
    findStoreButtonUrl: getSettingValue('about_find_store_button_url'),
  };
};