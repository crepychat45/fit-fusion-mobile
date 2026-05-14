import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  completed_at: string;
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  sets_completed?: number;
  reps_completed?: number[];
  weight_used?: number;
  notes?: string;
  created_at: string;
}

export const useWorkoutSessions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['workout-sessions', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkoutSession[];
    },
    enabled: !!userId || true,
  });

  const startSession = useMutation({
    mutationFn: async (workoutPlanId?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_plan_id: workoutPlanId,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({
        title: 'Workout Started',
        description: 'Your workout session has begun!',
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

  const completeSession = useMutation({
    mutationFn: async ({ 
      id, 
      duration_minutes, 
      calories_burned, 
      notes 
    }: { 
      id: string; 
      duration_minutes?: number; 
      calories_burned?: number; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_minutes,
          calories_burned,
          notes,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({
        title: 'Workout Complete!',
        description: 'Great job! Your progress has been saved.',
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
    sessions,
    isLoading,
    error,
    startSession,
    completeSession,
  };
};

export const useStats = (userId?: string) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User not authenticated');

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', targetUserId)
        .not('completed_at', 'is', null);
      
      if (error) throw error;

      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const totalCalories = sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
      
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekSessions = sessions.filter(
        s => new Date(s.completed_at!) >= lastWeek
      );

      return {
        totalSessions,
        totalMinutes,
        totalCalories,
        thisWeekSessions: thisWeekSessions.length,
        averageDuration: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      };
    },
  });

  return { stats, isLoading };
};
