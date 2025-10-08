import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  days_per_week: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string[];
  muscle_groups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  video_url?: string;
  image_url?: string;
}

export const useWorkoutPlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutPlans, isLoading, error } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkoutPlan[];
    },
  });

  const createWorkoutPlan = useMutation({
    mutationFn: async (plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert(plan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast({
        title: 'Success',
        description: 'Workout plan created successfully',
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

  const updateWorkoutPlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkoutPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast({
        title: 'Success',
        description: 'Workout plan updated successfully',
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

  const deleteWorkoutPlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast({
        title: 'Success',
        description: 'Workout plan deleted successfully',
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
    workoutPlans,
    isLoading,
    error,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
  };
};

export const useExercises = (filters?: { category?: string; difficulty?: string }) => {
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises', filters],
    queryFn: async () => {
      let query = supabase.from('exercises').select('*');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Exercise[];
    },
  });

  return { exercises, isLoading, error };
};
