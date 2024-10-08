import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAdmin } from '@/integrations/supabase';
import { useAuth } from '@/context/AuthContext';

export const useEmployees = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*');
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user && user.role === 'admin',
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEmployee) => {
      try {
        // Insert the new employee
        const { data, error } = await supabase
          .from('employees')
          .insert([{
            ...newEmployee,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }

        console.log('Employee added successfully');
        return data[0];
      } catch (error) {
        console.error('Error in useAddEmployee:', error);
        throw error; // Re-throw the error to be handled by the component
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
    },
  });
};

// Remove the createEmployeeFolder function as it's no longer needed

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('employees')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user?.email, // Use the current user's email
        })
        .eq('user_id', id)
        .select();
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('user_id', id);
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
    },
  });
};
