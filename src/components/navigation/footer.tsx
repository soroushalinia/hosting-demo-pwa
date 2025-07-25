import React from 'react';
import Link from 'next/link';
import { DatabaseZapIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background/70 w-full border-t backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 p-3 text-center md:flex-row md:justify-between md:py-4">
        <div className="flex items-center gap-2">
          <DatabaseZapIcon className="text-primary size-6 md:size-5" />
          <span className="text-foreground text-sm font-semibold">Hosting Demo PWA</span>
        </div>

        <nav className="text-muted-foreground flex flex-wrap justify-center gap-4 text-xs md:flex-1 md:justify-center md:text-sm">
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/aup" className="hover:text-primary transition-colors">
            AUP
          </Link>
          <Link href="/docs" className="hover:text-primary transition-colors">
            Docs
          </Link>
          <Link href="/support" className="hover:text-primary transition-colors">
            Support
          </Link>
        </nav>

        <div className="text-muted-foreground text-sm select-none md:pr-2">
          &copy; {new Date().getFullYear()} Hosting Demo PWA
        </div>
      </div>
    </footer>
  );
}
