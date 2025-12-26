'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, BookOpen, Globe, Tag, BarChart, FileSearch, Search, Video, Headphones, Target, Share2, MessageSquare, Mail } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const workflows = [
    {
      title: 'SEO Campaigns',
      description: 'Manage SEO campaigns and optimization',
      icon: Search,
      href: '/seo-campaigns',
      color: 'text-blue-600'
    },
    {
      title: 'Websites',
      description: 'Manage websites and web properties',
      icon: Globe,
      href: '/websites',
      color: 'text-green-600'
    },
    {
      title: 'Blogs',
      description: 'Manage marketing blogs and content',
      icon: FileText,
      href: '/blogs',
      color: 'text-purple-600'
    },
    {
      title: 'White Papers',
      description: 'Manage white papers and research',
      icon: FileText,
      href: '/white-papers',
      color: 'text-indigo-600'
    },
    {
      title: 'EBooks',
      description: 'Manage digital ebooks',
      icon: BookOpen,
      href: '/ebooks',
      color: 'text-pink-600'
    },
    {
      title: 'Marketing Videos',
      description: 'Manage video content and campaigns',
      icon: Video,
      href: '/marketing-videos',
      color: 'text-red-600'
    },
    {
      title: 'Marketing Audios',
      description: 'Manage audio content and podcasts',
      icon: Headphones,
      href: '/marketing-audios',
      color: 'text-yellow-600'
    },
    {
      title: 'Ad Campaigns',
      description: 'Manage advertising campaigns and performance',
      icon: Target,
      href: '/ad-campaigns',
      color: 'text-teal-600'
    },
    {
      title: 'Social Campaigns',
      description: 'Manage social media campaigns',
      icon: Share2,
      href: '/social-campaigns',
      color: 'text-violet-600'
    },
    {
      title: 'Email Marketing',
      description: 'Manage email campaigns and performance',
      icon: Mail,
      href: '/email-marketing',
      color: 'text-sky-600'
    },
    {
      title: 'Marketing Content',
      description: 'Manage marketing content and publications',
      icon: FileText,
      href: '/marketing-content',
      color: 'text-emerald-600'
    },
    {
      title: 'WhatsApp Campaigns',
      description: 'Manage WhatsApp marketing campaigns',
      icon: MessageSquare,
      href: '/marketing-whatsapp',
      color: 'text-lime-600'
    },
    {
      title: 'Coupons',
      description: 'Manage promotional coupons and offers',
      icon: Tag,
      href: '/coupons',
      color: 'text-orange-600'
    },
    {
      title: 'Offers',
      description: 'Manage promotional offers and discounts',
      icon: Tag,
      href: '/offers',
      color: 'text-rose-600'
    },
    {
      title: 'Analytics',
      description: 'View analytics and insights',
      icon: BarChart,
      href: '/analytics',
      color: 'text-cyan-600'
    },
    {
      title: 'Audit Logs',
      description: 'View system audit logs and activity',
      icon: FileSearch,
      href: '/audit-logs',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your workflows and content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workflows.map((workflow) => {
          const Icon = workflow.icon;
          return (
            <Link key={workflow.href} href={workflow.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-6 w-6 ${workflow.color}`} />
                    <CardTitle className="text-xl">{workflow.title}</CardTitle>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}