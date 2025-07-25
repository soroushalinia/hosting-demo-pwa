import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const FAQPage = () => {
  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible>
        <AccordionItem value="q1">
          <AccordionTrigger>What is VPS hosting?</AccordionTrigger>
          <AccordionContent>
            VPS hosting provides you with your own isolated virtual server environment on a physical
            server. This means dedicated resources, full root access, and greater control compared
            to shared hosting.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q2">
          <AccordionTrigger>How do I check if my server is online?</AccordionTrigger>
          <AccordionContent>
            You can check the <strong>Status</strong> page anytime to see real-time status of all
            our services, including your VPS server status.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q3">
          <AccordionTrigger>What happens if my service is down?</AccordionTrigger>
          <AccordionContent>
            We work hard to maintain 99.9% uptime. In case of downtime, our technical team will
            address the issue ASAP. You can check updates on the Status page or contact support.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q4">
          <AccordionTrigger>Can I upgrade my VPS plan later?</AccordionTrigger>
          <AccordionContent>
            Yes! You can upgrade your VPS resources anytime through the control panel or by
            contacting support.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q5">
          <AccordionTrigger>How do I contact support?</AccordionTrigger>
          <AccordionContent>
            Our support is available 24/7 via email at{' '}
            <a href="mailto:support@demo-vps-hosting.com" className="text-blue-600 underline">
              support@demo-vps-hosting.com
            </a>{' '}
            or through the control panel chat feature.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q6">
          <AccordionTrigger>What operating systems can I install on my VPS?</AccordionTrigger>
          <AccordionContent>
            We support popular operating systems including various Linux distributions (Ubuntu,
            CentOS, Debian) and Windows Server editions.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q7">
          <AccordionTrigger>Do I get root access to my VPS?</AccordionTrigger>
          <AccordionContent>
            Yes, VPS hosting provides full root or administrative access so you can configure your
            server as you wish.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q8">
          <AccordionTrigger>Can I install custom software on my VPS?</AccordionTrigger>
          <AccordionContent>
            Absolutely! You have the freedom to install and configure any software compatible with
            your VPS operating system.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q9">
          <AccordionTrigger>Is my VPS isolated from other users?</AccordionTrigger>
          <AccordionContent>
            Yes, VPS hosting provides isolated environments to ensure your resources and data are
            secure and separated from others.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q10">
          <AccordionTrigger>What kind of resources do VPS plans include?</AccordionTrigger>
          <AccordionContent>
            Typical VPS plans include dedicated CPU cores, RAM, storage space (SSD/HDD), and
            bandwidth allocation.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q11">
          <AccordionTrigger>How do backups work for my VPS?</AccordionTrigger>
          <AccordionContent>
            We offer automated backup options, and you can also manually back up your VPS data
            through the control panel.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q12">
          <AccordionTrigger>Can I host websites on my VPS?</AccordionTrigger>
          <AccordionContent>
            Yes, a VPS is perfect for hosting websites, web apps, and services requiring higher
            performance and control.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q13">
          <AccordionTrigger>Is my VPS protected against DDoS attacks?</AccordionTrigger>
          <AccordionContent>
            We include DDoS protection at the network level to safeguard your VPS against common
            attack vectors.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q14">
          <AccordionTrigger>Can I install a control panel like cPanel or Plesk?</AccordionTrigger>
          <AccordionContent>
            Yes, you can install popular control panels, but some require additional licenses which
            you will need to provide.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q15">
          <AccordionTrigger>How do I restart or shut down my VPS?</AccordionTrigger>
          <AccordionContent>
            You can restart, shut down, or power cycle your VPS from the control panel or via SSH
            with proper commands.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q16">
          <AccordionTrigger>Can I scale my VPS resources up or down?</AccordionTrigger>
          <AccordionContent>
            Yes, resource scaling is available. Contact support or use the control panel to upgrade
            or downgrade your plan.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q17">
          <AccordionTrigger>What is the network speed for my VPS?</AccordionTrigger>
          <AccordionContent>
            Our VPS plans typically include 1 Gbps or higher network speeds, depending on your
            selected plan.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q18">
          <AccordionTrigger>Are there any restrictions on what I can host?</AccordionTrigger>
          <AccordionContent>
            We prohibit illegal content, spamming, and activities violating our terms of service.
            Otherwise, you&apos;re free to host your projects.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q19">
          <AccordionTrigger>Can I transfer my existing VPS to your hosting?</AccordionTrigger>
          <AccordionContent>
            We can assist you with migration. Contact our support team for detailed transfer steps
            and assistance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q20">
          <AccordionTrigger>How is billing handled for VPS hosting?</AccordionTrigger>
          <AccordionContent>
            Billing is monthly by default, with options for annual billing. Payments can be made via
            credit card, PayPal, or other supported methods.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q21">
          <AccordionTrigger>What kind of customer support do you provide?</AccordionTrigger>
          <AccordionContent>
            We offer 24/7 customer support through email, live chat, and ticketing systems to help
            with technical or account issues.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q22">
          <AccordionTrigger>Can I install multiple websites on one VPS?</AccordionTrigger>
          <AccordionContent>
            Yes, with proper configuration, your VPS can host multiple websites using virtual hosts
            or control panels.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q23">
          <AccordionTrigger>Do you offer managed VPS services?</AccordionTrigger>
          <AccordionContent>
            We offer both unmanaged and managed VPS options. Managed services include maintenance,
            security updates, and monitoring.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q24">
          <AccordionTrigger>What virtualization technology is used?</AccordionTrigger>
          <AccordionContent>
            Our VPS plans use KVM virtualization to provide efficient and secure isolation between
            servers.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="q25">
          <AccordionTrigger>Can I get a refund if I’m not satisfied?</AccordionTrigger>
          <AccordionContent>
            We offer a 7-day money-back guarantee for new customers. Please review our refund policy
            for details.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQPage;
