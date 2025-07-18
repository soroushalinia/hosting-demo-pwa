'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

const snippets = {
  bash: `#!/usr/bin/env bash
# Create a new VPS via Example API
API_TOKEN="YOUR_API_TOKEN"
curl -X POST "https://api.example.com/v1/vps" \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-vps",
    "region": "us-west-1",
    "size": "small"
  }'`,
  python: `#!/usr/bin/env python3
"""Create a new VPS via Example API"""
import requests

API_TOKEN = "YOUR_API_TOKEN"
url = "https://api.example.com/v1/vps"
payload = {
    "name": "my-vps",
    "region": "us-west-1",
    "size": "small"
}
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
response.raise_for_status()
print("VPS Created:", response.json())`,
  go: `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
)

func main() {
  apiToken := "YOUR_API_TOKEN"
  url := "https://api.example.com/v1/vps"

  payload := map[string]string{
    "name":   "my-vps",
    "region": "us-west-1",
    "size":   "small",
  }

  body, _ := json.Marshal(payload)
  req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer "+apiToken)
  req.Header.Set("Content-Type", "application/json")

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    panic(err)
  }
  defer resp.Body.Close()

  fmt.Println("Status:", resp.Status)
}`,
  ts: `// Create a new VPS via Example API (TypeScript)
const API_TOKEN = "YOUR_API_TOKEN";

async function createVPS() {
  const response = await fetch("https://api.example.com/v1/vps", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "my-vps",
      region: "us-west-1",
      size: "small",
    }),
  });

  if (!response.ok) {
    throw new Error(\`Error creating VPS: \${response.status}\`);
  }

  const data = await response.json();
  console.log("VPS Created:", data);
}

createVPS().catch(console.error);`,
};

function CodeTabs() {
  const [lang, setLang] = useState<'bash' | 'python' | 'go' | 'ts'>('bash');

  useEffect(() => {
    Prism.highlightAll();
  }, [lang]);

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <div className="flex space-x-1 bg-gray-100 p-2 dark:bg-gray-800">
        {Object.keys(snippets).map((key) => (
          <button
            key={key}
            onClick={() => setLang(key as any)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${lang === key ? 'bg-white shadow dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <pre
        style={{
          background: 'transparent',
        }}
        className="overflow-x-auto rounded-b-lg bg-gray-700 p-4 dark:bg-gray-900"
      >
        <code className={`language-${lang}`}>{snippets[lang]}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">Documentation</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about our VPS hosting platform.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Start Guide</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="space-y-2 p-6">
            <h3 className="font-medium">1. Create an Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign up and verify your email to get started with your first VPS.
            </p>
            <p className="text-primary text-sm">Create Account →</p>
          </Card>
          <Card className="space-y-2 p-6">
            <h3 className="font-medium">2. Deploy Your First Server</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your configuration and deploy in under 55 seconds.
            </p>
            <p className="text-primary text-sm">Deployment Guide →</p>
          </Card>
          <Card className="space-y-2 p-6">
            <h3 className="font-medium">3. Connect via SSH</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Learn how to securely connect to your VPS using SSH.
            </p>
            <p className="text-primary text-sm">SSH Guide →</p>
          </Card>
          <Card className="space-y-2 p-6">
            <h3 className="font-medium">4. Manage Your Server</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor resources, configure backups, and manage settings.
            </p>
            <p className="text-primary text-sm">Management Guide →</p>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Popular Topics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.title}
              className="hover:bg-accent cursor-pointer p-4 transition-colors"
            >
              <Link href={topic.href} className="space-y-2">
                <h3 className="font-medium">{topic.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">API Reference</h2>
          <Button variant="outline" asChild>
            <Link href="#">View Full API Docs</Link>
          </Button>
        </div>
        <CodeTabs />
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-semibold tracking-tight">Need Help?</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <Button asChild>
          <Link href="/support">Contact Support</Link>
        </Button>
      </section>
    </div>
  );
}

const topics = [
  {
    title: 'Server Security',
    description: 'Best practices for securing your VPS and implementing firewalls.',
    href: '/docs',
  },
  {
    title: 'Backups & Recovery',
    description: 'Learn about our automated backup system and disaster recovery.',
    href: '/docs',
  },
  {
    title: 'Scaling Applications',
    description: 'Guidelines for scaling your applications horizontally and vertically.',
    href: '/docs',
  },
  {
    title: 'Load Balancing',
    description: 'Set up load balancing across multiple VPS instances.',
    href: '/docs',
  },
  {
    title: 'Monitoring',
    description: "Monitor your server's health, performance, and resource usage.",
    href: '/docs',
  },
  {
    title: 'Network Configuration',
    description: 'Configure networking, DNS, and IP addressing for your VPS.',
    href: '/docs',
  },
];
