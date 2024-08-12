import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase';
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

      // Create a folder for the new employee in the user_documents bucket
      const folderName = `employee_${data[0].emp_id.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user_documents')
          .upload(`${folderName}/.keep`, new Blob(['']));

        if (uploadError) {
          console.error('Error creating employee folder:', uploadError);
          throw new Error('Failed to create employee folder');
        }
      } catch (storageError) {
        console.error('Error creating employee folder:', storageError);
        throw new Error('Failed to create employee folder');
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
    },
  });
};

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
