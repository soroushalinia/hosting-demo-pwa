'use client';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  const {
    data: userData,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    },
  });

  useEffect(() => {
    if (isFetched && userData === null) {
      router.replace('/auth');
    }
  }, [isFetched, userData, router]);
  if (isLoading || !isFetched || userData === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }
  return <div></div>;
}
