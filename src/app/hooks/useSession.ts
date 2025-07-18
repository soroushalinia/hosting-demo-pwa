'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useEffect } from 'react';

export const useSession = () => {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      queryClient.setQueryData(['session'], newSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return sessionQuery;
};
