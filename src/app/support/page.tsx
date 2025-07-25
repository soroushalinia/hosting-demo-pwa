import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">Support Center</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Get help with your VPS hosting and infrastructure needs.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-semibold">Common Issues</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">SSH Connection Issues</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Learn how to troubleshoot SSH connection problems and fix common authentication
                errors.
              </p>
              <Link href="/docs" className="text-primary text-sm">
                Read guide →
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Server Performance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tips for optimizing your server&apos;s performance and resolving slowdown issues.
              </p>
              <Link href="/dashboard/create" className="text-primary text-sm">
                View solutions →
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Billing Questions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Find answers about billing cycles, payment methods, and invoices.
              </p>
              <Link href="/faq" className="text-primary text-sm">
                View FAQ →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl font-semibold">Contact Support</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Brief description of your issue" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup defaultValue="normal" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="normal"
                    value="normal"
                    name="priority"
                    className="text-primary"
                  />
                  <Label htmlFor="normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="urgent"
                    value="urgent"
                    name="priority"
                    className="text-primary"
                  />
                  <Label htmlFor="urgent">Urgent</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder="Describe your issue in detail..."
              />
            </div>
            <span className="text-primary border-primary inline-block cursor-not-allowed rounded-md border px-4 py-2 text-sm font-medium">
              Submit Ticket
            </span>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <Link href="/faq" className="text-primary text-sm">
            View all questions →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-4">
              <h3 className="font-medium">{faq.question}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">System Status</h2>
          <Link href="/status" className="text-primary text-sm">
            View status page →
          </Link>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
            <p className="text-sm">All systems operational</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

const faqs = [
  {
    question: "How do I reset my server's root password?",
    answer:
      "You can reset your root password through the control panel. Navigate to your server settings and use the 'Reset Password' option.",
  },
  {
    question: "What's included in the backup service?",
    answer:
      'Our backup service includes daily snapshots of your entire server, with 7-day retention for regular plans and 30-day retention for premium plans.',
  },
  {
    question: 'How can I upgrade my server resources?',
    answer:
      "You can upgrade your server's CPU, RAM, and storage through the dashboard. Changes take effect within minutes with minimal downtime.",
  },
  {
    question: 'Do you offer DDoS protection?',
    answer:
      'Yes, all servers come with basic DDoS protection. Premium plans include advanced mitigation for layer 7 attacks.',
  },
];
