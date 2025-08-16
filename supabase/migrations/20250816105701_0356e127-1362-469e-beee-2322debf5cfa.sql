-- Insert About Page Settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
-- About Intro Section
('about_intro_text', 'We believe communication should be easy, affordable, and for everyone. Our mission is to empower communities with reliable and international-ready mobile service.', 'textarea', 'about', 'Main introductory text displayed after hero section'),

-- Features Section
('about_features_title', 'Features you''ll enjoy.', 'text', 'about', 'Title for features section'),
('about_features_cta_text', 'Shop Plans', 'text', 'about', 'CTA button text in features section'),
('about_features_cta_url', '/plans', 'text', 'about', 'CTA button URL in features section'),

-- Feature Cards (6 features)
('about_feature_1_title', 'International Friendly', 'text', 'about', 'Feature 1 title'),
('about_feature_1_description', 'Call 100+ countries without extra charges', 'text', 'about', 'Feature 1 description'),
('about_feature_1_icon', 'Globe', 'text', 'about', 'Feature 1 icon name'),

('about_feature_2_title', 'Reliable Network', 'text', 'about', 'Feature 2 title'),
('about_feature_2_description', 'Access to nationwide 5G networks', 'text', 'about', 'Feature 2 description'),
('about_feature_2_icon', 'Signal', 'text', 'about', 'Feature 2 icon name'),

('about_feature_3_title', 'No Hidden Fees', 'text', 'about', 'Feature 3 title'),
('about_feature_3_description', 'Transparent plans with no surprises', 'text', 'about', 'Feature 3 description'),
('about_feature_3_icon', 'CreditCard', 'text', 'about', 'Feature 3 icon name'),

('about_feature_4_title', 'Bilingual Support', 'text', 'about', 'Feature 4 title'),
('about_feature_4_description', 'English and Spanish-speaking support', 'text', 'about', 'Feature 4 description'),
('about_feature_4_icon', 'MessageSquare', 'text', 'about', 'Feature 4 icon name'),

('about_feature_5_title', 'Easy Top-Up', 'text', 'about', 'Feature 5 title'),
('about_feature_5_description', 'Recharge online or in-store', 'text', 'about', 'Feature 5 description'),
('about_feature_5_icon', 'Zap', 'text', 'about', 'Feature 5 icon name'),

('about_feature_6_title', 'Bring Your Own Phone', 'text', 'about', 'Feature 6 title'),
('about_feature_6_description', 'Keep your phone and number', 'text', 'about', 'Feature 6 description'),
('about_feature_6_icon', 'Smartphone', 'text', 'about', 'Feature 6 icon name'),

-- No Worries Section
('about_no_worries_title', 'What you won''t have to worry about.', 'text', 'about', 'Title for no worries section'),
('about_no_worry_1_text', 'No overage charges', 'text', 'about', 'No worry item 1 text'),
('about_no_worry_1_icon', 'X', 'text', 'about', 'No worry item 1 icon'),
('about_no_worry_2_text', 'No hidden fees', 'text', 'about', 'No worry item 2 text'),
('about_no_worry_2_icon', 'DollarSign', 'text', 'about', 'No worry item 2 icon'),
('about_no_worry_3_text', 'No 5G extra cost', 'text', 'about', 'No worry item 3 text'),
('about_no_worry_3_icon', 'Wifi', 'text', 'about', 'No worry item 3 icon'),
('about_no_worry_4_text', 'No credit checks', 'text', 'about', 'No worry item 4 text'),
('about_no_worry_4_icon', 'UserCheck', 'text', 'about', 'No worry item 4 icon'),

-- International Section
('about_international_title', 'International calling capabilities.', 'text', 'about', 'Title for international section'),
('about_international_description', 'Unlimited international calling to over 100 destinations is included in most plans.', 'text', 'about', 'Description for international section'),
('about_international_destinations_text', 'Popular destinations include: Mexico, Canada, India, China, Philippines, United Kingdom, Germany, France, Japan, South Korea, and many more countries across North America, South America, Europe, Asia, and Africa.', 'textarea', 'about', 'Destinations list text'),

-- Phone Options Section
('about_phone_options_title', 'Bring the phone you already have or buy a new one.', 'text', 'about', 'Title for phone options section'),
('about_bring_phone_title', 'Bring your phone.', 'text', 'about', 'Bring your phone card title'),
('about_bring_phone_description', 'Switch and keep your device. Most unlocked phones work on our network.', 'text', 'about', 'Bring your phone card description'),
('about_bring_phone_button_text', 'Get Started', 'text', 'about', 'Bring your phone button text'),
('about_bring_phone_button_url', '/activate', 'text', 'about', 'Bring your phone button URL'),
('about_bring_phone_image_url', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'text', 'about', 'Bring your phone image URL'),

('about_buy_phone_title', 'Buy a new one.', 'text', 'about', 'Buy new phone card title'),
('about_buy_phone_description', 'Find the best device with financing options on new and pre-owned phones.', 'text', 'about', 'Buy new phone card description'),
('about_buy_phone_button_text', 'Shop Phones', 'text', 'about', 'Buy new phone button text'),
('about_buy_phone_button_url', '/phones', 'text', 'about', 'Buy new phone button URL'),
('about_buy_phone_image_url', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'text', 'about', 'Buy new phone image URL'),

-- Store Finder Section
('about_store_finder_title', 'Shop online or find your nearest store.', 'text', 'about', 'Title for store finder section'),
('about_shop_online_image_url', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'text', 'about', 'Shop online image URL'),
('about_shop_online_button_text', 'Shop Online', 'text', 'about', 'Shop online button text'),
('about_shop_online_button_url', '/plans', 'text', 'about', 'Shop online button URL'),
('about_find_store_image_url', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 'text', 'about', 'Find store image URL'),
('about_find_store_button_text', 'Find a Store', 'text', 'about', 'Find store button text'),
('about_find_store_button_url', '/stores', 'text', 'about', 'Find store button URL');