-- Add updated_at column to appointment_requests
ALTER TABLE appointment_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
