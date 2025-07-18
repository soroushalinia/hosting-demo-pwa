'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/hooks/useSession';

type AuthView = 'login' | 'register' | 'register-confirm';

const signupSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Lowercase required')
    .regex(/[A-Z]/, 'Uppercase required')
    .regex(/\d/, 'Digit required'),
  displayName: z.string().min(3, 'Display name required'),
});

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password is required'),
});

export default function Auth() {
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation<true, Error, z.infer<typeof loginSchema>>({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => setError(null),
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signupSchema>) => {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { displayName: data.displayName, credit: 10 },
        },
      });
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      setView('register-confirm');
      setError(null);
      resetSignup();
    },
    onError: (err: Error) => setError(err.message),
  });

  useEffect(() => {
    if (session?.user) router.replace('/');
  }, [session, router]);

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    setError(null);
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof signupSchema>) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-6">
        {view === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Sign in with your email and password</CardDescription>
            </CardHeader>
            <form onSubmit={handleLoginSubmit(onLogin)}>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" {...registerLogin('email')} autoComplete="email" />
                  {loginErrors.email && (
                    <span className="text-destructive text-xs">{loginErrors.email.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...registerLogin('password')}
                    autoComplete="current-password"
                  />
                  {loginErrors.password && (
                    <span className="text-destructive text-xs">{loginErrors.password.message}</span>
                  )}
                </div>
                {error && <div className="text-destructive my-2 text-sm">{error}</div>}
              </CardContent>
              <CardFooter className="mt-6 flex flex-col items-stretch gap-4">
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setView('register')}>
                  Create an account
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {view === 'register' && (
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignupSubmit(onRegister)}>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    {...registerSignup('email')}
                  />
                  {signupErrors.email && (
                    <span className="text-destructive text-xs">{signupErrors.email.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    {...registerSignup('password')}
                  />
                  {signupErrors.password && (
                    <span className="text-destructive text-xs">
                      {signupErrors.password.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-displayName">Display Name</Label>
                  <Input
                    id="register-displayName"
                    type="text"
                    autoComplete="nickname"
                    {...registerSignup('displayName')}
                  />
                  {signupErrors.displayName && (
                    <span className="text-destructive text-xs">
                      {signupErrors.displayName.message}
                    </span>
                  )}
                </div>
                {error && <div className="text-destructive my-2 text-sm">{error}</div>}
              </CardContent>
              <CardFooter className="mt-6 flex flex-col items-stretch gap-4">
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Signing up...' : 'Sign Up'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setView('login')}>
                  Back to Login
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {view === 'register-confirm' && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm your email</CardTitle>
              <CardDescription>
                We’ve sent a confirmation link to your email. Please check your inbox to activate
                your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mt-4 w-full" onClick={() => setView('login')}>
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
