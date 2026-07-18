import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/validation';

export interface UserProfile {
  id: number;
  user_id: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_level?: string | null;
  fitness_goals?: string[] | null;
  body_measurements?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdates = Partial<
  Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

// ---------- helpers ----------

const isTransient = (err: unknown): boolean => {
  const msg = (err as { message?: string } | null)?.message?.toLowerCase() ?? '';
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('temporar') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('504')
  );
};

/**
 * Whitelist and sanitize updates before hitting the database. Any field not
 * on the allow-list is silently dropped so components can't send garbage
 * columns, and strings are sanitized to strip XSS payloads.
 */
const normalizeUpdates = (raw: ProfileUpdates): ProfileUpdates => {
  const out: ProfileUpdates = {};
  const allowed: (keyof ProfileUpdates)[] = [
    'name', 'username', 'bio', 'avatar_url', 'website',
    'age', 'height_cm', 'weight_kg', 'fitness_level',
    'fitness_goals', 'body_measurements',
  ];
  for (const key of allowed) {
    if (!(key in raw)) continue;
    const val = raw[key];
    if (val === undefined) continue;

    if (val === null || val === '') { out[key] = null as never; continue; }

    if (typeof val === 'string') {
      const cleaned = sanitizeInput(val).slice(0, 2000);
      out[key] = (cleaned.length ? cleaned : null) as never;
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v) => sanitizeInput(v).slice(0, 200))
        .slice(0, 20) as never;
      continue;
    }
    if (typeof val === 'number') {
      out[key] = (Number.isFinite(val) ? val : null) as never;
      continue;
    }
    if (typeof val === 'object') {
      // Shallow sanitize object string values
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (typeof v === 'string') clean[k] = sanitizeInput(v).slice(0, 500);
        else if (v == null || typeof v === 'number' || typeof v === 'boolean') clean[k] = v;
      }
      out[key] = clean as never;
    }
  }
  return out;
};

// ---------- hook ----------

export const useProfile = (userId?: string, options: { enabled?: boolean } = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  const { data: profile, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['profile', userId ?? 'me'],
    enabled,
    retry: (failureCount, err) => failureCount < 3 && isTransient(err),
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (data) return data as UserProfile;

      // Auto-create only for the authenticated user
      if (!user || user.id !== targetUserId) return null;

      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      const seed = normalizeUpdates({
        name: (meta.full_name as string) || (meta.name as string) || null,
        username: user.email ? user.email.split('@')[0] : null,
        avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
        bio: null,
      });

      // Race-safe insert: if another mount created the row first, re-select.
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({ user_id: targetUserId, ...seed })
        .select()
        .maybeSingle();

      if (createError) {
        // 23505 = unique violation → someone else already created it
        if ((createError as { code?: string }).code === '23505') {
          const { data: existing } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', targetUserId)
            .maybeSingle();
          return (existing ?? null) as UserProfile | null;
        }
        throw createError;
      }
      return (created ?? null) as UserProfile | null;
    },
  });

  const updateProfile = useMutation({
    mutationKey: ['profile-update', userId ?? 'me'],
    retry: (failureCount, err) => failureCount < 2 && isTransient(err),
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 3000),
    mutationFn: async (updates: ProfileUpdates) => {
      // Always re-validate auth server-side; never trust a stale user id.
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be signed in to update your profile');

      const clean = normalizeUpdates(updates);
      if (Object.keys(clean).length === 0) {
        throw new Error('Nothing to update');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(clean)
        .eq('user_id', user.id) // scoped strictly to the caller — RLS enforces this too
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    onSuccess: (data) => {
      // Update cache in place so no refetch clobbers editor state.
      if (data) {
        queryClient.setQueryData(['profile', userId ?? 'me'], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Could not save profile',
        description: err.message || 'Please check your connection and try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    profile: (profile ?? null) as UserProfile | null,
    isLoading,
    isFetching,
    error,
    refetch,
    updateProfile,
  };
};

// ---------- avatar upload ----------

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const useAvatarUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    retry: (failureCount, err) => failureCount < 2 && isTransient(err),
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 3000),
    mutationFn: async (file: File) => {
      if (!file) throw new Error('No image selected');
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Only JPG, PNG, WEBP or GIF images are allowed');
      }
      if (file.size <= 0) throw new Error('Image file is empty');
      if (file.size > MAX_AVATAR_BYTES) throw new Error('Image must be smaller than 5 MB');

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be signed in to upload an avatar');

      const rawExt = file.name.split('.').pop() ?? '';
      const safeExt = (rawExt.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg').slice(0, 5);
      const fileName = `${Date.now()}.${safeExt}`;
      const filePath = `${user.id}/avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fitusion.data')
        .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('fitusion.data').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Photo updated', description: 'Your new profile photo is live.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });

  const removeAvatar = useMutation({
    retry: (failureCount, err) => failureCount < 2 && isTransient(err),
    mutationFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be signed in to remove your avatar');

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Photo removed', description: 'Your profile photo was removed.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not remove photo', description: err.message, variant: 'destructive' });
    },
  });

  return { uploadAvatar, removeAvatar };
};

