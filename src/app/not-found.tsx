import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
        <AlertTriangle className="text-yellow-600 dark:text-yellow-300" size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. Double-check the URL or head back
          home.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
