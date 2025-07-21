import { z } from 'zod';

export const createVpsSchema = z
  .object({
    serverName: z
      .string()
      .min(4)
      .regex(/^[a-zA-Z0-9-]+$/),
    authMethod: z.enum(['password', 'ssh-key']),
    authValue: z.string(),
    cpu: z.number().int().min(1).max(32),
    ram: z.number().int().min(1).max(128),
    storage: z.number().int().min(10).max(2000),
    ipv4: z.number().int().min(1).max(10),
    ipv6: z.number().int().min(0).max(16),
    location: z.enum(['us-east', 'us-west', 'eu-central', 'asia-east']),
    os: z.enum(['ubuntu', 'debian', 'centos', 'alpine', 'windows-server']),
  })
  .refine(
    (d) => (d.authMethod === 'password' ? d.authValue.length >= 8 : d.authValue.startsWith('ssh-')),
    {
      path: ['authValue'],
      message: 'Password must be at least 8 characters or SSH key must start with "ssh-"',
    },
  );

export type CreateVpsInput = z.infer<typeof createVpsSchema>;

export const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: 'page must be positive' }),

  pageSize: z
    .string()
    .optional()
    .default('10')
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, { message: 'pageSize must be between 1 and 100' }),

  sortBy: z
    .enum(['created_at', 'cpu', 'ram', 'server_name', 'status'])
    .optional()
    .default('created_at'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
