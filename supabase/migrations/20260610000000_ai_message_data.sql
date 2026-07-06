-- Add message_data JSONB column to store full serialized UIMessage objects.
-- This preserves tool invocations, parts structure, and metadata across DB round-trips.
-- Nullable for backward compatibility — old messages use text-only fallback.
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS message_data JSONB;
