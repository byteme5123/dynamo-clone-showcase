-- Clean up duplicate transactions (keep only the latest one for each PayPal order)
DELETE FROM transactions 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY paypal_order_id, user_id 
             ORDER BY created_at DESC
           ) as rn 
    FROM transactions 
    WHERE paypal_order_id IS NOT NULL
  ) t WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE transactions 
ADD CONSTRAINT unique_paypal_order_per_user 
UNIQUE (paypal_order_id, user_id);