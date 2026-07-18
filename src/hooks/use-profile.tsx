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
    queryKey: ['profile', userId],
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();
      
      // If no profile exists, auto-create one from auth metadata
      if (error && error.code === 'PGRST116' && user) {
        const meta = user.user_metadata || {};
        const newProfile = {
          user_id: targetUserId,
          name: meta.full_name || meta.name || null,
          username: meta.email?.split('@')[0] || null,
          avatar_url: meta.avatar_url || meta.picture || null,
          bio: null,
        };
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        if (createError) throw createError;
        return created as UserProfile;
      }
      
      if (error) throw error;
      return data as UserProfile;
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
