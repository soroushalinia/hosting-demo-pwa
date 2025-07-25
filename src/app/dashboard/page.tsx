'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { querySchema } from '@/schemas/vps';
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  Funnel,
  Grid,
  List,
  Globe,
  Cpu,
  HardDrive,
  Server,
  MapPin,
  Power,
  MemoryStick,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import clsx from 'clsx';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const sortOptions = [
  { label: 'Recent', value: 'created_at' },
  { label: 'CPU', value: 'cpu' },
  { label: 'RAM', value: 'ram' },
  { label: 'Name', value: 'server_name' },
  { label: 'Status', value: 'status' },
];

type Server = {
  id: string;
  cpu: number;
  ram: number;
  storage: number;
  ipv4: string;
  ipv6: string;
  status: string;
  location: string;
  created_at: string;
  server_name: string;
};

type FetchResponse = {
  server_list: Server[];
  pagination: {
    totalPages: number;
    page: number;
    pageSize: number;
    total: number;
  };
};

const statusColors: Record<string, string> = {
  on: 'green',
  off: 'red',
  pending: 'yellow',
};

const locationMap: Record<string, string> = {
  'us-east': 'US East',
  'us-west': 'US West',
  'eu-central': 'EU Central',
  'asia-east': 'Asia East',
};

export default function Dashboard() {
  const router = useRouter();

  const [view, setView] = useState<'table' | 'card'>('card');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<z.infer<typeof querySchema>['sortBy']>('created_at');
  const [sortOrder, setSortOrder] = useState<z.infer<typeof querySchema>['sortOrder']>('desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchServers = async (): Promise<FetchResponse> => {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      router.replace('/auth');
      throw new Error('Not authenticated');
    }
    const token = session.access_token;

    const params = new URLSearchParams({
      page: String(page),
      pageSize: view === 'table' ? String(16) : String(12),
      sortBy,
      sortOrder,
    });

    const res = await fetch(`/api/vps?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch servers');
    }
    const data = (await res.json()) as FetchResponse;
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryFn: fetchServers,
    queryKey: ['vps', page, sortBy, sortOrder, debouncedSearch, view],
  });

  const filteredServers = data?.server_list.filter((s) =>
    [s.server_name, s.ipv4].some((field) =>
      field.toLowerCase().includes(debouncedSearch.toLowerCase()),
    ),
  );

  const currentPage = data?.pagination.page || 1;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">Server Dashboard</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Manage and monitor your servers easily.
        </p>
      </section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden w-full flex-col gap-4 sm:flex sm:flex-row sm:items-center sm:gap-2">
          <Input
            placeholder="Search by server name or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm"
          />
          <Select
            value={sortBy}
            onValueChange={(val) =>
              setSortBy(val as 'created_at' | 'cpu' | 'ram' | 'server_name' | 'status')
            }
          >
            <SelectTrigger className="w-full sm:w-[125px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => setView(view === 'table' ? 'card' : 'table')}
            className="w-full py-3 text-base"
            variant="outline"
          >
            {view === 'table' ? <Grid className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </Button>
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full py-3 text-base"
            variant="outline"
          >
            {sortOrder === 'asc' ? (
              <ArrowDownNarrowWide className="h-5 w-5" />
            ) : (
              <ArrowUpNarrowWide className="h-5 w-5" />
            )}
          </Button>
          <div className="sm:hidden">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className="w-full py-3 text-base" variant="outline">
                  <Funnel className="h-5 w-5" />
                </Button>
              </DrawerTrigger>

              <DrawerContent className="rounded-t-8xl" aria-describedby="Search & Sort">
                <DrawerHeader>
                  <DrawerTitle>Search & Sort</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-4">
                  <Input
                    placeholder="Search by server name or IP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <div className="mt-2 flex flex-col gap-1">
                    <p className="text-sm font-medium">Sort By</p>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value as 'created_at' | 'server_name' | 'cpu' | 'ram');
                          setDrawerOpen(false);
                        }}
                        className={clsx(
                          'flex items-center justify-between rounded px-3 py-2 text-sm transition-colors',
                          sortBy === opt.value ? 'bg-muted font-semibold' : 'hover:bg-muted/60',
                        )}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check className="text-primary h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <Button
            onClick={() => router.push('/dashboard/create')}
            className="w-full py-3 whitespace-nowrap sm:col-span-2"
          >
            Create
          </Button>
        </div>
      </div>
      {isLoading && view === 'table' && (
        <div className="w-full animate-pulse">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 7 }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isLoading && view === 'card' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-muted/40 h-[170px] rounded-2xl border p-5 shadow-md transition"
            >
              <div className="mb-4 flex items-center gap-2">
                <Server className="text-primary h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading servers</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Something went wrong while fetching your server list.
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {filteredServers &&
        filteredServers.length > 0 &&
        (view === 'table' ? (
          <Table className="min-w-full overflow-x-auto">
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Server className="text-muted-foreground h-4 w-4" />
                    Server Name
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Cpu className="text-muted-foreground h-4 w-4" />
                    CPU
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <MemoryStick className="text-muted-foreground h-4 w-4" />
                    RAM
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <HardDrive className="text-muted-foreground h-4 w-4" />
                    Storage
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Globe className="text-muted-foreground h-4 w-4" />
                    Primary IP (v4)
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Power className="text-muted-foreground h-4 w-4" />
                    Status
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    Location
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="scrollbar-hide max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredServers.map((s) => (
                <TableRow
                  key={s.id}
                  className="hover:bg-muted cursor-pointer transition"
                  onClick={() => router.push(`/dashboard/server/${s.id}`)}
                >
                  <TableCell>
                    <span className="font-mono">{s.server_name}</span>
                  </TableCell>
                  <TableCell>{s.cpu} Cores</TableCell>
                  <TableCell>{s.ram} GB</TableCell>
                  <TableCell>{s.storage} GB</TableCell>
                  <TableCell>
                    <span className="font-mono">{s.ipv4.split(',')[0]?.trim() || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="capitalize">
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span
                          className={`bg-opacity-75 absolute inline-flex h-full w-full animate-ping rounded-full bg-${statusColors[s.status]}-400`}
                        />
                        <span
                          className={`relative inline-flex size-2 rounded-full bg-${statusColors[s.status]}-500`}
                        />
                      </span>
                      {s.status}
                    </div>
                  </TableCell>
                  <TableCell>{locationMap[s.location]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServers.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/dashboard/server/${s.id}`)}
                className="group border-border bg-muted/40 hover:bg-muted/30 cursor-pointer rounded-2xl border p-5 shadow-md transition hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Server className="text-primary h-5 w-5" />
                  <h3 className="font-mono text-xl font-semibold">{s.server_name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-muted-foreground h-4 w-4" />
                    <span>{s.cpu} vCores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="text-muted-foreground h-4 w-4" />
                    <span>{s.storage} GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="text-muted-foreground h-4 w-4" />
                    <span>{s.ram} GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="max-w-[8rem] overflow-hidden font-mono text-sm text-ellipsis whitespace-nowrap">
                      {s.ipv4.split(',')[0]?.trim() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Power className={`h-4 w-4 text-${statusColors[s.status]}-400`} />
                    <span className={`capitalize text-${statusColors[s.status]}-400`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span>{locationMap[s.location]}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      {!isLoading && filteredServers && filteredServers?.length === 0 && (
        <div className="text-muted-foreground py-10 text-center">No servers found.</div>
      )}

      {!isLoading &&
        filteredServers &&
        filteredServers?.length !== 0 &&
        data &&
        data?.pagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 1
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                if (
                  (pageNum === currentPage - 2 && pageNum > 1) ||
                  (pageNum === currentPage + 2 && pageNum < totalPages)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${pageNum}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
    </div>
  );
}
