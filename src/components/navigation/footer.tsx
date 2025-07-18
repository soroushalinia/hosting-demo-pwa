import React from 'react';
import { DatabaseZapIcon } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bottom-0 z-40 flex h-[56px] w-screen items-center justify-center border-t bg-transparent backdrop-blur">
      <div className="flex h-[56px] w-full max-w-7xl flex-row items-center justify-between px-4">
        <div className="flex flex-row items-center gap-2">
          <DatabaseZapIcon className="text-primary drop-shadow" size={22} />
          <span className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Hosting Demo PWA
          </span>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded p-3 text-xs font-medium transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/support"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded p-3 text-xs font-medium transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
