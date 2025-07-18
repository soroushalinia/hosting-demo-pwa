'use client';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatabaseZapIcon, User2Icon, LogOutIcon, SunIcon, MoonIcon, MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="hover:bg-primary/10 text-primary p-5"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <SunIcon size={24} /> : <MoonIcon size={24} />}
    </Button>
  );
};

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.replace('/auth');
    setSheetOpen(false);
  };

  const user = session?.user;
  const displayName = user?.user_metadata?.displayName || user?.email;
  const credit = user?.user_metadata?.credit;

  return (
    <div className="sticky top-0 z-50 flex h-[60px] w-screen items-center justify-center border-b bg-transparent backdrop-blur">
      <div className="flex h-[60px] w-full max-w-7xl flex-row items-center justify-between px-4">
        <Link href="/" className="flex flex-row items-center gap-2">
          <DatabaseZapIcon className="text-primary drop-shadow" size={28} />
          <h1 className="text-primary text-xl font-semibold tracking-tight drop-shadow-sm">
            Hosting Demo PWA
          </h1>
        </Link>

        <div className="hidden flex-row items-center gap-2 sm:flex">
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded p-3 text-sm font-medium transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/support"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded p-3 text-sm font-medium transition-colors"
          >
            Support
          </Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/profile" passHref>
                <Button
                  variant="ghost"
                  className="hover:bg-primary/10 flex h-11 items-center gap-2 rounded px-3 transition-colors"
                  aria-label="Profile"
                >
                  <User2Icon className="text-primary" size={32} />
                  <div className="flex flex-col items-start text-left leading-tight select-none">
                    <span className="text-primary text-xs font-medium">{displayName}</span>
                    {credit !== undefined && (
                      <span className="text-muted-foreground text-xs">Credit: ${credit}</span>
                    )}
                  </div>
                </Button>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Logout"
                onClick={handleLogout}
                className="hover:bg-destructive/10 ml-0.5 h-11 w-11"
              >
                <LogOutIcon className="text-destructive" size={24} />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              onClick={() => router.push('/auth')}
            >
              Login
            </Button>
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="hover:bg-primary/10 p-1 sm:hidden"
            >
              <MenuIcon size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-border bg-background flex w-[280px] flex-col justify-between border-l p-4 shadow-xl"
          >
            <div>
              <Link
                href="/"
                onClick={() => setSheetOpen(false)}
                className="mb-6 flex items-center gap-2"
              >
                <DatabaseZapIcon className="text-primary drop-shadow" size={24} />
                <span className="text-primary text-lg font-semibold tracking-tight drop-shadow-sm">
                  Hosting Demo PWA
                </span>
              </Link>

              {user && (
                <Link
                  href="/profile"
                  className="border-muted bg-muted/30 mt-6 mb-4 flex items-center gap-3 rounded-md border px-4 py-3"
                >
                  <User2Icon className="text-primary" size={24} />
                  <div className="flex flex-col text-sm">
                    <span className="text-primary font-medium">{displayName}</span>
                    {credit !== undefined && (
                      <span className="text-muted-foreground text-xs">Credit: ${credit}</span>
                    )}
                  </div>
                </Link>
              )}

              <nav className="mt-2 flex flex-col gap-4">
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setSheetOpen(false)}
                >
                  Docs
                </Link>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setSheetOpen(false)}
                >
                  Support
                </Link>
              </nav>
            </div>

            <div className="mt-6 space-y-4 pt-6">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOutIcon size={18} className="mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    router.push('/auth');
                    setSheetOpen(false);
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
