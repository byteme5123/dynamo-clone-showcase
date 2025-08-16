-- Insert site settings for homepage content management

-- Branding settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('navbar_logo_url', '/src/assets/dynamo-wireless-logo.png', 'image', 'branding', 'Logo displayed in the navigation bar'),
('footer_logo_url', '/src/assets/dynamo-wireless-logo.png', 'image', 'branding', 'Logo displayed in the footer');

-- Notification bar settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('notification_bar_text', 'Get up to 25% off when you purchase a 3 month plan!', 'text', 'notification-bar', 'Main promotional text in notification bar'),
('notification_bar_account_link', '/account', 'text', 'notification-bar', 'My Account link URL'),
('notification_bar_activate_link', '/activate', 'text', 'notification-bar', 'Activate link URL'),
('notification_bar_account_text', 'My Account', 'text', 'notification-bar', 'My Account link text'),
('notification_bar_activate_text', 'Activate', 'text', 'notification-bar', 'Activate link text');

-- Features section settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('features_title', 'Our affordable wireless plans include:', 'text', 'homepage-features', 'Main title for features section'),
('feature_1_title', 'Access to America''s largest 5G network', 'text', 'homepage-features', 'First feature description'),
('feature_2_title', '5G High speed data', 'text', 'homepage-features', 'Second feature description'),
('feature_3_title', 'Unlimited talk & text', 'text', 'homepage-features', 'Third feature description'),
('feature_4_title', 'Unlimited calling to 100+ destinations', 'text', 'homepage-features', 'Fourth feature description'),
('feature_5_title', 'Free mobile hotspot', 'text', 'homepage-features', 'Fifth feature description');

-- Coverage section settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('coverage_title', 'America''s Largest 5G networks.', 'text', 'homepage-coverage', 'Main title for coverage section'),
('coverage_description', 'Experience the power of our nationwide 5G network. With coverage in 99% of the United States, you''ll stay connected whether you''re in the city or exploring the great outdoors.', 'text', 'homepage-coverage', 'Coverage section description'),
('coverage_stat_1_number', '98%', 'text', 'homepage-coverage', 'First statistic number'),
('coverage_stat_1_title', 'Population Coverage', 'text', 'homepage-coverage', 'First statistic title'),
('coverage_stat_1_desc', 'Reliable signal where you live and work', 'text', 'homepage-coverage', 'First statistic description'),
('coverage_stat_2_number', '300+', 'text', 'homepage-coverage', 'Second statistic number'),
('coverage_stat_2_title', 'Cities', 'text', 'homepage-coverage', 'Second statistic title'),
('coverage_stat_2_desc', '5G available in major metropolitan areas', 'text', 'homepage-coverage', 'Second statistic description'),
('coverage_button_text', 'Check Network Coverage', 'text', 'homepage-coverage', 'Coverage section CTA button text'),
('coverage_button_url', '/coverage', 'text', 'homepage-coverage', 'Coverage section CTA button URL'),
('coverage_image_url', '', 'image', 'homepage-coverage', 'Optional custom coverage section image');

-- CTA section settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('cta_title', 'Ready to Switch to Dynamo Wireless?', 'text', 'homepage-cta', 'Main CTA section title'),
('cta_subtitle', 'Join thousands of satisfied customers who''ve made the switch to better coverage, more data, and unbeatable prices.', 'text', 'homepage-cta', 'CTA section subtitle'),
('cta_point_1_number', '2 min', 'text', 'homepage-cta', 'First key point number'),
('cta_point_1_label', 'Quick Setup', 'text', 'homepage-cta', 'First key point label'),
('cta_point_2_number', '$0', 'text', 'homepage-cta', 'Second key point number'),
('cta_point_2_label', 'Activation Fee', 'text', 'homepage-cta', 'Second key point label'),
('cta_point_3_number', '24/7', 'text', 'homepage-cta', 'Third key point number'),
('cta_point_3_label', 'Support', 'text', 'homepage-cta', 'Third key point label'),
('cta_primary_button_text', 'Make a Switch', 'text', 'homepage-cta', 'Primary CTA button text'),
('cta_primary_button_url', '/activate', 'text', 'homepage-cta', 'Primary CTA button URL'),
('cta_secondary_button_text', 'Learn about offers', 'text', 'homepage-cta', 'Secondary CTA button text'),
('cta_secondary_button_url', '/plans', 'text', 'homepage-cta', 'Secondary CTA button URL');

-- Navbar settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('navbar_activate_button_text', 'Activate SIM', 'text', 'navbar', 'Navbar activate button text'),
('navbar_activate_button_url', '/activate', 'text', 'navbar', 'Navbar activate button URL');

-- Footer settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('footer_description', 'America''s most reliable wireless network with nationwide 5G coverage, unlimited plans, and exceptional customer service.', 'text', 'footer', 'Footer company description'),
('footer_phone', '(1-800) DYNAMO', 'text', 'footer', 'Footer contact phone'),
('footer_email', 'support@dynamowireless.com', 'text', 'footer', 'Footer contact email'),
('footer_facebook_url', '#', 'text', 'footer', 'Facebook social link'),
('footer_twitter_url', '#', 'text', 'footer', 'Twitter social link'),
('footer_instagram_url', '#', 'text', 'footer', 'Instagram social link'),
('footer_linkedin_url', '#', 'text', 'footer', 'LinkedIn social link');