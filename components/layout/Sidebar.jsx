'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, TrendingUp, Globe, Ticket, BarChart3, FileText, BookOpen, Menu, X, Video, Headphones, Target, Share2, MessageSquare, Mail, Tag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'SEO Campaigns', href: '/seo', icon: TrendingUp },
  { name: 'Websites', href: '/websites', icon: Globe },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Ad Campaigns', href: '/ad-campaigns', icon: Target },
  { name: 'Social Campaigns', href: '/social-campaigns', icon: Share2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Blogs', href: '/blogs', icon: FileText },
  { name: 'White Papers', href: '/white-papers', icon: FileText },
  { name: 'EBooks', href: '/ebooks', icon: BookOpen },
  { name: 'Marketing Videos', href: '/marketing-videos', icon: Video },
  { name: 'Marketing Audios', href: '/marketing-audios', icon: Headphones },
  { name: 'Marketing Content', href: '/marketing-content', icon: FileText },
  { name: 'WhatsApp Campaigns', href: '/marketing-whatsapp', icon: MessageSquare },
  { name: 'Email Marketing', href: '/email-marketing', icon: Mail },
  { name: 'Email Analysis', href: '/email-analysis', icon: BarChart3 },
  { name: 'Offers', href: '/offers', icon: Tag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}