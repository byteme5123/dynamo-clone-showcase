-- Enable real-time for activate_sim_requests table
ALTER TABLE public.activate_sim_requests REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.activate_sim_requests;