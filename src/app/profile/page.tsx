'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { toast } from 'sonner';

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'Lowercase required')
      .regex(/[A-Z]/, 'Uppercase required')
      .regex(/\d/, 'Digit required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'Lowercase required')
      .regex(/[A-Z]/, 'Uppercase required')
      .regex(/\d/, 'Digit required'),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const displayNameSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters'),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type DisplayNameForm = z.infer<typeof displayNameSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const displayNameForm = useForm<DisplayNameForm>({
    resolver: zodResolver(displayNameSchema),
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const updateCredits = useMutation({
    mutationFn: async (amount: number) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found');

      const currentCredits = Number(user.user_metadata?.credit || 0);
      const newCredits = currentCredits + amount;

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          credit: newCredits,
        },
      });

      if (error) throw error;
      return newCredits;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast('Credits updated successfully.');
    },
  });

  const updatePassword = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      passwordForm.reset();
      toast('Password updated successfully.');
    },
  });

  const updateDisplayName = useMutation({
    mutationFn: async (data: DisplayNameForm) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found');

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          display_name: data.displayName,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast('Display name updated successfully.');
    },
  });

  useEffect(() => {
    if (userData?.user_metadata?.display_name) {
      displayNameForm.setValue('displayName', userData.user_metadata.display_name);
    }
  }, [userData, displayNameForm]);

  if (userLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">Profile Settings</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-semibold">Account Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <form
                onSubmit={displayNameForm.handleSubmit((data) => updateDisplayName.mutate(data))}
              >
                <div className="flex gap-2">
                  <Input
                    {...displayNameForm.register('displayName')}
                    placeholder="Enter display name"
                  />
                  <button
                    type="submit"
                    className="text-primary border-primary hover:bg-primary/10 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
                {displayNameForm.formState.errors.displayName && (
                  <p className="mt-1 text-sm text-red-500">
                    {displayNameForm.formState.errors.displayName.message}
                  </p>
                )}
              </form>
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Account Credits</Label>
                <span className="text-primary text-2xl font-bold">
                  ${userData?.user_metadata?.credit || 0}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Amount to add"
                  className="w-full"
                  id="creditAmount"
                />
                <button
                  type="button"
                  className="text-primary border-primary hover:bg-primary/10 inline-flex rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap"
                  onClick={() => {
                    const input = document.getElementById('creditAmount') as HTMLInputElement;
                    const amount = parseInt(input.value);
                    if (!isNaN(amount) && amount > 0) {
                      updateCredits.mutate(amount);
                      input.value = '';
                    }
                  }}
                >
                  Add Credits
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Credits can be used to pay for VPS services and additional resources.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <form
            onSubmit={passwordForm.handleSubmit((data) => updatePassword.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                {...passwordForm.register('currentPassword')}
                placeholder="Enter current password"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                {...passwordForm.register('newPassword')}
                placeholder="Enter new password"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                {...passwordForm.register('confirmPassword')}
                placeholder="Confirm new password"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="text-primary border-primary hover:bg-primary/10 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
            >
              Update Password
            </button>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Last Login</h2>
        <Card className="p-6">
          {userData?.last_sign_in_at && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {new Date(userData.last_sign_in_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </p>
                <p className="text-sm text-gray-500">Last successful login (your local time)</p>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
