'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          We encountered an unexpected error while processing your request. Please try again, or
          contact support if the problem persists.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  );
}
