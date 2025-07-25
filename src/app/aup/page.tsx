import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AUPPage = () => {
  return (
    <div className="prose mx-auto">
      <h1 className="mb-8 text-4xl font-extrabold">Acceptable Use Policy (AUP)</h1>

      <p>
        Thank you for choosing our VPS hosting services. To ensure a safe, secure, and high-quality
        experience for all users, we require compliance with this Acceptable Use Policy. By using
        our services, you agree to abide by the terms outlined below.
      </p>

      <Card className="my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">1. Scope and Applicability</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This policy applies to all customers and users of our VPS hosting services. It governs
            acceptable behavior and use of resources to maintain a trustworthy and stable
            environment.
          </p>
        </CardContent>
      </Card>

      <Card className="my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">2. Prohibited Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Users must not engage in any of the following activities while using our services:</p>
          <ul className="mt-2 ml-6 list-disc space-y-2">
            <li>
              <strong>Illegal Activities:</strong> Any use of the service that violates laws,
              regulations, or third-party rights, including but not limited to hacking, fraud,
              distribution of pirated content, or unauthorized access.
            </li>
            <li>
              <strong>Spam & Abuse:</strong> Sending unsolicited emails, bulk messages, or engaging
              in any form of harassment or abuse of other users or systems.
            </li>
            <li>
              <strong>Resource Abuse:</strong> Excessive consumption of CPU, memory, bandwidth, or
              disk space beyond allocated limits that adversely affects other customers or our
              network performance.
            </li>
            <li>
              <strong>Malware & Security Threats:</strong> Hosting, distributing, or executing
              malicious software, viruses, or scripts that may harm systems or users.
            </li>
            <li>
              <strong>Unauthorized Access:</strong> Attempting to access other customers’ servers,
              accounts, or infrastructure without explicit permission.
            </li>
            <li>
              <strong>Network Interference:</strong> Engaging in activities that disrupt the
              operation of the internet or our services, including denial-of-service attacks.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">3. Monitoring and Enforcement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            To maintain service quality and security, we reserve the right to monitor network and
            server usage. Violations of this policy may result in:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-2">
            <li>Temporary suspension of service.</li>
            <li>Permanent termination of accounts.</li>
            <li>Reporting to appropriate law enforcement agencies if applicable.</li>
          </ul>
          <p>
            We strive to notify affected users where possible but may act immediately in cases of
            severe or ongoing abuse.
          </p>
        </CardContent>
      </Card>

      <Card className="my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">4. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>As a user, you are responsible for:</p>
          <ul className="mt-2 ml-6 list-disc space-y-2">
            <li>Ensuring that your usage complies with this policy and all relevant laws.</li>
            <li>Maintaining the security of your account credentials.</li>
            <li>Promptly reporting any suspected violations or security incidents to us.</li>
            <li>Using resources fairly and respecting the rights of other users.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">5. Amendments to this Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We reserve the right to update or modify this Acceptable Use Policy at any time. Any
            changes will be communicated via email or posted on our website. Continued use of our
            services after changes constitutes acceptance of the updated terms.
          </p>
        </CardContent>
      </Card>

      <h2 className="mt-12 text-2xl font-bold">Contact Information</h2>
      <p>
        If you have any questions or concerns regarding this policy, please reach out to our support
        team:
      </p>
      <p>
        <a href="mailto:support@demo-vps-hosting.com" className="underline">
          support@demo-vps-hosting.com
        </a>
      </p>
    </div>
  );
};

export default AUPPage;
