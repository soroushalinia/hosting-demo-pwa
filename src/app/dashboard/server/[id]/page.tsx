'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Power,
  Trash2,
  KeyRound,
  Server,
  PowerOff,
  Cpu,
  Info,
  Globe,
  Activity,
  Database,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { useSimulatedUsage } from './useSimulatedUsage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const TerminalComponent = dynamic(() => import('./terminal'), { ssr: false });

interface VPSData {
  id: string;
  cpu: number;
  ram: number;
  storage: number;
  ipv4: string;
  ipv6: string;
  status: 'on' | 'off' | 'pending';
  location: 'us-east' | 'us-west' | 'eu-central' | 'asia-east';
  created_at: string;
  user_id: string;
  os: 'ubuntu' | 'debian' | 'centos' | 'alpine' | 'windows-server';
  auth_method: 'password' | 'ssh';
  server_name: string;
  last_startup: string | null;
}

const locationMap: Record<VPSData['location'], string> = {
  'us-east': 'US East',
  'us-west': 'US West',
  'eu-central': 'EU Central',
  'asia-east': 'Asia East',
};

const osMap: Record<VPSData['os'], string> = {
  ubuntu: 'Ubuntu 22.04',
  debian: 'Debian 12',
  centos: 'CentOS 8 ',
  alpine: 'Alpine Linux',
  'windows-server': 'Windows Server 2022',
};

const keys = ['cpu', 'ram', 'upload', 'download'] as const;

const chartColorMap: Record<(typeof keys)[number], string> = {
  cpu: '#3b82f6',
  ram: '#10b981',
  upload: '#f59e0b',
  download: '#8b5cf6',
};

function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUptime(lastStartupISO: string | null): string {
  if (!lastStartupISO) return 'N/A';
  const lastStartup = new Date(lastStartupISO);
  const diffMs = Date.now() - lastStartup.getTime();
  if (diffMs < 0) return 'N/A';

  const seconds = Math.floor(diffMs / 1000) % 60;

  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let result = '';
  if (days) result += `${days} day${days > 1 ? 's' : ''} `;
  if (hours) result += `${hours} hour${hours > 1 ? 's' : ''} `;
  if (minutes) result += `${minutes} min `;
  result += `${seconds} sec`;

  return result.trim();
}

function StatusDot({ status }: Readonly<{ status: string }>) {
  let baseColor = 'bg-gray-400';
  let pingColor = 'bg-gray-400';

  if (status === 'on') {
    baseColor = 'bg-green-500';
    pingColor = 'bg-green-400';
  } else if (status === 'off') {
    baseColor = 'bg-red-500';
    pingColor = 'bg-red-400';
  } else if (status === 'pending') {
    baseColor = 'bg-yellow-400';
    pingColor = 'bg-yellow-300';
  }

  return (
    <span className="relative mr-2 flex size-3" aria-label={status}>
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pingColor} opacity-75`}
      />
      <span className={`relative inline-flex size-3 rounded-full ${baseColor}`} />
    </span>
  );
}

export default function VPSPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [uptime, setUptime] = useState('N/A');
  const [showTerminal, setShowTerminal] = useState(false);
  const fallbackData = useMemo(
    () => ({
      status: 'off',
      ram: 1,
      cpu: 1,
    }),
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['vps', id],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.replace('/auth');
        throw new Error('Not authenticated');
      }
      const token = session.access_token;
      const res = await fetch(`/api/vps/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch VPS data');
      const json: VPSData = await res.json();
      return { server: json, session };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.server.last_startup) {
      const update = () => setUptime(formatUptime(data.server.last_startup));
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.server.last_startup]);

  const usageInput = useMemo(() => {
    const safe = data?.server ?? fallbackData;
    return { status: safe.status, ram: safe.ram, cpu: safe.cpu };
  }, [data, fallbackData]);

  const usageData = useSimulatedUsage(usageInput.status, usageInput.ram, usageInput.cpu);

  const powerMutation = useMutation({
    mutationFn: ({ id, command }: { id: string; command: 'poweron' | 'poweroff' | 'reboot' }) =>
      fetch(`/api/vps/power`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data?.session.access_token}`,
        },
        body: JSON.stringify({ id, command }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vps', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/vps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${data?.session.access_token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vps'] });
      toast('Server deleted successfully.');
      router.push('/dashboard');
    },
  });

  if (isLoading || !data)
    return (
      <div className="mx-auto mt-16 space-y-6">
        <div className="flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-8 w-64" />
        <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full md:col-span-2" />
        </div>
      </div>
    );

  const { server_name, ipv4, status, created_at, location, os } = data.server;

  const createdDate = new Date(created_at).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="mx-auto space-y-4">
      <div className="mt-4 flex justify-start">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <div className="mt-6 flex justify-center">
        <Server size={42} className="text-primary-600" />
      </div>

      <h1 className="text-center font-mono text-2xl font-bold break-words">{server_name}</h1>

      <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Badge variant="outline" className="font-mono text-sm whitespace-nowrap md:text-lg">
          Primary IPv4: {ipv4.split(',')[0]}
        </Badge>
        <Badge variant="outline">
          <div className="flex items-center space-x-2 text-lg font-semibold">
            <StatusDot status={status} />
            <span>{capitalizeFirstLetter(status)}</span>
          </div>
        </Badge>
      </div>

      <br />
      <Tabs defaultValue="overview">
        <TabsList className="flex w-full justify-center space-x-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Cpu className="text-primary-600 h-5 w-5" />
                <CardTitle>Server Specs</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" /> <strong>CPU:</strong> {data.server.cpu} vCore
                </div>
                <div className="flex items-center gap-1">
                  <Server className="h-4 w-4" /> <strong>RAM:</strong> {data.server.ram} GB
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" /> <strong>Storage:</strong>{' '}
                  {data.server.storage * 0.125} GB / {data.server.storage} GB (12.5%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Info className="text-primary-600 h-5 w-5" />
                <CardTitle>Server Info</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-sm">
                <div>
                  <strong>Location:</strong> {locationMap[location]}
                </div>
                <div>
                  <strong>OS:</strong> {osMap[os]}
                </div>
                <div>
                  <strong>Created:</strong> {createdDate}
                </div>
                <div>
                  <strong>Uptime:</strong> {uptime}
                </div>
              </CardContent>
            </Card>

            <Card className="max-w-full overflow-x-auto md:col-span-2">
              <CardHeader className="flex items-center gap-2">
                <Globe className="text-primary-600 h-5 w-5" />
                <CardTitle>IP Addresses</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4 text-sm">
                {data.server.ipv4 && (
                  <div>
                    <div className="mb-1 flex items-center gap-1 font-medium">IPv4</div>
                    <div className="flex flex-wrap gap-2">
                      {data.server.ipv4.split(',').map((ip, idx) => (
                        <Badge key={idx} variant="outline" className="whitespace-nowrap">
                          {ip.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.server.ipv6 && (
                  <div>
                    <div className="mb-1 flex items-center gap-1 font-medium">IPv6</div>
                    <div className="flex flex-wrap gap-2">
                      {data.server.ipv6.split(',').map((ip, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="truncate sm:max-w-[300px]"
                          title={ip.trim()}
                        >
                          {ip.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          {status === 'off' && (
            <Alert variant="destructive" className="mt-2 mb-4">
              <PowerOff className="text-destructive size-5" />
              <AlertTitle>Server is off</AlertTitle>
              <AlertDescription>
                The server is currently off. To view usage data, please turn it on.
              </AlertDescription>
            </Alert>
          )}
          {status === 'pending' && (
            <Alert variant="default" className="mt-4 mb-6">
              <PowerOff className="size-5" />
              <AlertTitle>Server Not Ready</AlertTitle>
              <AlertDescription>
                Please wait until the server is turned on before accessing usage data.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {keys.map((key) => {
              const latest = usageData[usageData.length - 1] ?? ({} as string);
              const value = latest[key] ?? 0;
              const percent =
                key === 'ram' && data.server.ram
                  ? `${((value / (data.server.ram * 1024)) * 100).toFixed(1)} %`
                  : '';
              const label =
                key === 'ram'
                  ? `${value.toFixed(1)} MB (${(value / 1024).toFixed(2)} GB)`
                  : key === 'cpu'
                    ? `${value.toFixed(1)} %`
                    : `${value.toFixed(1)} Mbps`;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{key.toUpperCase()} Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress
                      className="h-2"
                      value={
                        key === 'ram' && data.server.ram
                          ? (value / (data.server.ram * 1024)) * 100
                          : value
                      }
                    />
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span>{percent}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 space-y-6">
            {[
              { key: 'cpu', name: 'CPU Usage (%)' },
              { key: 'ram', name: 'RAM Usage (MB)' },
              { key: 'upload', name: 'Upload (Mbps)' },
              { key: 'download', name: 'Download (Mbps)' },
            ].map(({ key, name }) => {
              const typedKey = key as keyof typeof chartColorMap;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={usageData.map((e, i) => ({ ...e, index: i }))}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={chartColorMap[typedKey]}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={chartColorMap[typedKey]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="index" hide />
                        <YAxis />
                        <ChartTooltip />
                        <Area
                          type="monotone"
                          dataKey={key}
                          stroke={chartColorMap[typedKey]}
                          fill={`url(#color-${key})`}
                          isAnimationActive={false}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <>
            <div className="mx-auto mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => {
                  toast(`Server power ${status === 'on' ? 'off' : 'on'} requested`);
                  powerMutation.mutate({
                    id: data.server.id,
                    command: status === 'on' ? 'poweroff' : 'poweron',
                  });
                }}
              >
                <Power className="h-5 w-5" />
                {status === 'on' ? 'Power Off' : 'Power On'}
              </Button>

              {status === 'on' && (
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={() => {
                    toast('Server reboot requested');
                    powerMutation.mutate({
                      id: data.server.id,
                      command: 'reboot',
                    });
                  }}
                >
                  <RotateCcw className="h-5 w-5" />
                  Reboot
                </Button>
              )}

              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => alert('Reset password triggered')}
              >
                <KeyRound className="h-5 w-5" />
                Reset Root Password
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 text-green-600 dark:text-green-300"
                onClick={() => {
                  if (status === 'on') {
                    setShowTerminal(!showTerminal);
                  } else {
                    toast('Cannot connect to server when power is off.');
                  }
                }}
              >
                <Server className="h-5 w-5" />
                {showTerminal === false ? 'Connect via SSH' : 'Disconnect SSH'}
              </Button>
              <Button
                variant="destructive"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-5 w-5" />
                Delete Server
              </Button>
            </div>
            {status === 'on' && showTerminal === true && (
              <div className="mt-6 w-full rounded-lg border">
                <p className="p-4 text-center text-lg font-bold">
                  <span className="font-mono">{server_name}</span> Console
                </p>

                <div className="p-4">
                  <TerminalComponent server_name={server_name}></TerminalComponent>
                </div>
              </div>
            )}
          </>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4 text-sm">
            Type <strong>{server_name}</strong> to confirm deletion.
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Type server name"
            className="w-full rounded border p-2"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmInput !== server_name}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
