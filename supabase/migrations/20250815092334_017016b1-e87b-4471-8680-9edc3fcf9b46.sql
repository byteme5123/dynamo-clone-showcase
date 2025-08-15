-- Update the plan_type enum to include domestic and special values
ALTER TYPE plan_type ADD VALUE 'domestic';
ALTER TYPE plan_type ADD VALUE 'special';

-- Update existing plans to use the new plan types
-- Set all prepaid and postpaid plans to domestic initially
UPDATE plans SET plan_type = 'domestic'::plan_type WHERE plan_type IN ('prepaid'::plan_type, 'postpaid'::plan_type);

-- Update plans that contain 'special' or 'international' in their name to be special plans
UPDATE plans SET plan_type = 'special'::plan_type 
WHERE (name ILIKE '%special%' OR name ILIKE '%international%' OR 
       countries IS NOT NULL AND array_length(countries, 1) > 0);

-- Note: We keep the old enum values for now to avoid breaking existing data
-- They can be removed in a future migration if needed