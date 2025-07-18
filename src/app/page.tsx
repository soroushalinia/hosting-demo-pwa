import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Cloud Infrastructure Made Simple
        </h1>
        <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
          Deploy your applications with confidence using our reliable and scalable VPS hosting
          solutions.
        </p>
        <div className="flex flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Image src="/globe.svg" alt="Global" width={24} height={24} />
            </div>
            <h3 className="font-semibold">Global Infrastructure</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Deploy your applications across multiple regions for optimal performance.
          </p>
        </Card>
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Image src="/window.svg" alt="Dashboard" width={24} height={24} />
            </div>
            <h3 className="font-semibold">Simple Dashboard</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your servers with our intuitive and powerful control panel.
          </p>
        </Card>
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Image src="/file.svg" alt="Backups" width={24} height={24} />
            </div>
            <h3 className="font-semibold">Automated Backups</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Keep your data safe with automated daily backups and easy restoration.
          </p>
        </Card>
      </section>

      {/* Pricing Section */}
      <section className="space-y-8">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 md:text-xl dark:text-gray-400">
            Choose the plan that's right for you
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="space-y-6 p-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Starter</h3>
              <p className="text-gray-500 dark:text-gray-400">Perfect for small projects</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">$10/mo</p>
              <Button className="w-full" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>2 CPU Cores</li>
              <li>2GB RAM</li>
              <li>50GB SSD Storage</li>
              <li>2TB Transfer</li>
            </ul>
          </Card>
          <Card className="border-primary space-y-6 p-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-gray-500 dark:text-gray-400">For growing applications</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">$25/mo</p>
              <Button className="w-full" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>4 CPU Cores</li>
              <li>8GB RAM</li>
              <li>160GB SSD Storage</li>
              <li>5TB Transfer</li>
            </ul>
          </Card>
          <Card className="space-y-6 p-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <p className="text-gray-500 dark:text-gray-400">For large scale deployments</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">$50/mo</p>
              <Button className="w-full" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>8 CPU Cores</li>
              <li>16GB RAM</li>
              <li>320GB SSD Storage</li>
              <li>10TB Transfer</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="space-y-6 py-8 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Get Started?</h2>
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
          Join thousands of developers who trust us with their infrastructure needs.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth">Create Account</Link>
        </Button>
      </section>
    </div>
  );
}
