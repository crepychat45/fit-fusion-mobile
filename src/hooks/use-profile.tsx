import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: number;
  user_id: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: string;
  fitness_goals?: string[];
  body_measurements?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string, options: { enabled?: boolean } = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId ?? 'me'],
    enabled,
    retry: 1,
    // Longer freshness window + disabled focus refetch prevents the editor
    // form being clobbered while the user is typing.
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

      // maybeSingle() → no row is a valid state, not an error
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (data) return data as UserProfile;

      // First-time user: auto-create a profile only for the authenticated user
      if (!user || user.id !== targetUserId) return null;

      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      const seed = {
        user_id: targetUserId,
        name: (meta.full_name as string) || (meta.name as string) || null,
        username: user.email ? user.email.split('@')[0] : null,
        avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
        bio: null,
      };
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert(seed)
        .select()
        .maybeSingle();
      if (createError) throw createError;
      return (created ?? null) as UserProfile | null;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
};

export const useAvatarUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const safeExt = fileExt?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${safeExt}`;
      const filePath = `${user.id}/avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fitusion.data')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fitusion.data')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeAvatar = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Photo removed', description: 'Your profile photo was removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { uploadAvatar, removeAvatar };
};
