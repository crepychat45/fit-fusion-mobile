CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT 'New chat',
  thread_type text NOT NULL DEFAULT 'ai' CHECK (thread_type IN ('ai', 'direct', 'group')),
  participant_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  participant_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_pinned boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  is_muted boolean NOT NULL DEFAULT false,
  encryption_enabled boolean NOT NULL DEFAULT true,
  last_message_preview text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_threads_owner_participant CHECK (owner_id IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat threads"
ON public.chat_threads
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create their chat threads"
ON public.chat_threads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id OR auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update their chat threads"
ON public.chat_threads
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR auth.uid() = ANY(participant_ids))
WITH CHECK (auth.uid() = owner_id OR auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can delete owned chat threads"
ON public.chat_threads
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_role text NOT NULL DEFAULT 'user' CHECK (sender_role IN ('user', 'assistant', 'system')),
  recipient_id uuid,
  content text NOT NULL DEFAULT '',
  encrypted_payload jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  reactions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  client_message_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chat threads"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = chat_messages.thread_id
      AND (t.owner_id = auth.uid() OR auth.uid() = ANY(t.participant_ids))
  )
);

CREATE POLICY "Users can create messages in their chat threads"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = chat_messages.thread_id
      AND (t.owner_id = auth.uid() OR auth.uid() = ANY(t.participant_ids))
  )
  AND (sender_id IS NULL OR sender_id = auth.uid())
);

CREATE POLICY "Users can update messages in their chat threads"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = chat_messages.thread_id
      AND (t.owner_id = auth.uid() OR auth.uid() = ANY(t.participant_ids))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = chat_messages.thread_id
      AND (t.owner_id = auth.uid() OR auth.uid() = ANY(t.participant_ids))
  )
);

CREATE POLICY "Users can delete owned chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = chat_messages.thread_id
      AND t.owner_id = auth.uid()
  )
);

CREATE INDEX idx_chat_threads_owner_updated ON public.chat_threads(owner_id, last_message_at DESC);
CREATE INDEX idx_chat_threads_participants ON public.chat_threads USING gin(participant_ids);
CREATE INDEX idx_chat_messages_thread_created ON public.chat_messages(thread_id, created_at ASC);
CREATE INDEX idx_chat_messages_sender_created ON public.chat_messages(sender_id, created_at DESC);

CREATE TRIGGER update_chat_threads_updated_at
BEFORE UPDATE ON public.chat_threads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();