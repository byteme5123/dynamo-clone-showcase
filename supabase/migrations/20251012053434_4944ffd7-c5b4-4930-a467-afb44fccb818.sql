-- Add plan subscription columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS plan_status TEXT CHECK (plan_status IN ('active', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS plan_purchase_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMPTZ;

-- Create index for faster queries on active plans
CREATE INDEX IF NOT EXISTS idx_profiles_current_plan ON profiles(current_plan_id) WHERE plan_status = 'active';

-- Create index for expiry date queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expiry ON profiles(plan_expiry_date) WHERE plan_status = 'active';