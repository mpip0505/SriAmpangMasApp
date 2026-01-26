-- Add passcode columns to deliveries table
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS passcode VARCHAR(6),
ADD COLUMN IF NOT EXISTS passcode_expires_at TIMESTAMP;

-- Create index for fast passcode lookup
CREATE INDEX IF NOT EXISTS idx_deliveries_passcode ON deliveries(passcode);