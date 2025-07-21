'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Globe,
  Server,
  Info,
  Receipt,
  Monitor,
} from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createVpsSchema, CreateVpsInput } from '@/schemas/vps';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { calculatePrice } from '@/lib/price';

export default function CreateServer() {
  const router = useRouter();
  const {
    data: authData,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const [{ data: userData, error: userError }, { data: sessionData, error: sessionError }] =
        await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

      if (userError || !userData.user || sessionError || !sessionData.session) {
        return null;
      }

      return {
        user: userData.user,
        session: sessionData.session,
      };
    },
  });
  useEffect(() => {
    if (isFetched && authData?.user === null) {
      router.replace('/auth');
    }
  }, [isFetched, authData, router]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateVpsInput>({
    resolver: zodResolver(createVpsSchema),
    defaultValues: {
      serverName: '',
      authMethod: 'ssh-key',
      authValue: '',
      cpu: 2,
      ram: 8,
      storage: 20,
      ipv4: 1,
      ipv6: 0,
      location: 'us-east',
      os: 'ubuntu',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateVpsInput) => {
      const response = await fetch('/api/vps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData?.session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      await supabase.auth.refreshSession();
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to create VPS: ${errorResponse.error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('VPS created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateVpsInput) => {
    mutation.mutate(data);
  };

  const { cpuCost, ramCost, storageCost, ipv4Cost, totalMonthly } = calculatePrice({
    cpu: watch('cpu'),
    ram: watch('ram'),
    storage: watch('storage'),
    ipv4: watch('ipv4'),
  });
  const totalHourly = useMemo(() => totalMonthly / 720, [totalMonthly]);

  if (isLoading || !isFetched || authData === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h1 className="mb-1 text-2xl font-bold">Create New VPS</h1>
      <p className="mb-6 text-sm text-gray-600">Configure your server resources below</p>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="serverName" className="flex items-center gap-2">
              <Server size={16} />
              Server Name
            </Label>
            <Input
              id="serverName"
              {...register('serverName')}
              style={{ fontFamily: 'var(--font-fira-mono), monospace' }}
            />
            {errors.serverName && (
              <p className="text-sm text-red-600">{errors.serverName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Info size={16} />
              Authentication
            </Label>
            <Select
              value={watch('authMethod')}
              onValueChange={(val) => setValue('authMethod', val as 'password' | 'ssh-key')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="ssh-key">SSH Public Key</SelectItem>
              </SelectContent>
            </Select>
            {watch('authMethod') === 'password' ? (
              <Input type="password" placeholder="Enter password" {...register('authValue')} />
            ) : (
              <textarea
                style={{ fontFamily: 'var(--font-fira-mono), monospace' }}
                placeholder="Paste SSH public key"
                rows={3}
                className="w-full rounded border px-2 py-1"
                {...register('authValue')}
              />
            )}
            {errors.authValue && <p className="text-sm text-red-600">{errors.authValue.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Cpu size={16} />
              CPU: {watch('cpu')} cores
            </Label>
            <Slider
              min={1}
              max={32}
              step={1}
              value={[watch('cpu')]}
              onValueChange={(val) => setValue('cpu', val[0])}
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <MemoryStick size={16} />
              RAM: {watch('ram')} GB
            </Label>
            <Slider
              min={1}
              max={128}
              step={1}
              value={[watch('ram')]}
              onValueChange={(val) => setValue('ram', val[0])}
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <HardDrive size={16} />
              Storage: {watch('storage')} GB
            </Label>
            <Slider
              min={10}
              max={2000}
              step={10}
              value={[watch('storage')]}
              onValueChange={(val) => setValue('storage', val[0])}
            />
          </div>

          <div className="grid gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex cursor-help items-center gap-2">
                    <Network size={16} />
                    IPv4 Addresses: {watch('ipv4')}
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Each IPv4 costs extra due to scarcity. Max 10 per server.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[watch('ipv4')]}
              onValueChange={(val) => setValue('ipv4', val[0])}
            />
          </div>

          <div className="grid gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex cursor-help items-center gap-2">
                    <Network size={16} />
                    IPv6 Addresses: {watch('ipv6')}
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>IPv6 is free. You can assign up to 16.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Slider
              min={0}
              max={16}
              step={1}
              value={[watch('ipv6')]}
              onValueChange={(val) => setValue('ipv6', val[0])}
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="grid w-full gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex cursor-help items-center gap-2">
                      <Globe size={16} />
                      Location
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose the physical region where your server will be hosted.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select
                value={watch('location')}
                onValueChange={(val) => setValue('location', val as CreateVpsInput['location'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east">US East</SelectItem>
                  <SelectItem value="us-west">US West</SelectItem>
                  <SelectItem value="eu-central">EU Central</SelectItem>
                  <SelectItem value="asia-east">Asia East</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex cursor-help items-center gap-2">
                      <Monitor size={16} />
                      Operating System
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the OS to be installed on your VPS.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select
                value={watch('os')}
                onValueChange={(val) => setValue('os', val as CreateVpsInput['os'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ubuntu">Ubuntu 22.04</SelectItem>
                  <SelectItem value="debian">Debian 12</SelectItem>
                  <SelectItem value="centos">CentOS 8</SelectItem>
                  <SelectItem value="alpine">Alpine Linux</SelectItem>
                  <SelectItem value="windows-server">Windows Server 2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex h-full flex-col rounded-2xl border border-dashed p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <Receipt size={20} /> Receipt
            </h2>

            <div className="flex-grow">
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Server Name:</span>
                  <span className="font-mono">{watch('serverName')}</span>
                </li>
                <li className="flex justify-between">
                  <span>CPU ({watch('cpu')} cores):</span>
                  <span className="font-mono">${cpuCost.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>RAM ({watch('ram')} GB):</span>
                  <span className="font-mono">${ramCost.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Storage ({watch('storage')} GB):</span>
                  <span className="font-mono">${storageCost.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>IPv4 ({watch('ipv4')}):</span>
                  <span className="font-mono">${ipv4Cost.toFixed(2)}</span>
                </li>
              </ul>
            </div>

            <div className="mt-auto border-t border-dashed pt-3 text-sm font-semibold">
              <div className="flex justify-between">
                <span>Hourly:</span>
                <span className="font-mono text-green-700">${totalHourly.toFixed(4)} / hr</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly:</span>
                <span className="font-mono text-green-700">${totalMonthly.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="summary">
              <AccordionTrigger className="flex items-center gap-2">
                <Info size={16} />
                Important Info
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-700 dark:text-gray-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>24/7 support via live chat and ticket system.</li>
                  <li>IPv6 is free; IPv4 may incur additional fees.</li>
                  <li>Exceeding resource limits or abusive behavior may lead to suspension.</li>
                  <li>
                    Users must secure their servers and accept monitoring for abuse prevention.
                  </li>
                  <li>
                    Use of service means agreement to our{' '}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/aup" className="underline">
                      Acceptable Use Policy
                    </Link>
                    .
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" className="w-full px-8" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Create Server'}
          </Button>
        </div>
      </form>
    </div>
  );
}
