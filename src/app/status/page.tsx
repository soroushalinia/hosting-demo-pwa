import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ServiceStatus = 'operational' | 'degraded' | 'down';

const services = [
  { id: 1, name: 'VPS Hosting Service', status: 'operational' as ServiceStatus },
  { id: 2, name: 'Database Service', status: 'operational' as ServiceStatus },
  { id: 3, name: 'Storage Service', status: 'operational' as ServiceStatus },
  { id: 4, name: 'Network Connectivity', status: 'operational' as ServiceStatus },
  { id: 5, name: 'Control Panel', status: 'operational' as ServiceStatus },
];

const StatusPage = () => {
  return (
    <div className="mx-auto space-y-6">
      <h1 className="mb-6 text-3xl font-bold">Service Status</h1>

      {services.map(({ id, name }) => (
        <Card key={id}>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p>Status:</p>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>

              <Badge variant="default">Operational</Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Last Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{new Date().toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            All services are currently operational. If you notice any issues, please contact
            support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusPage;
