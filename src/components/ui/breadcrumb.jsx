'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PATH_LABELS = {
    admin: 'Admin',
    overview: 'Overview',
    production: 'Production',
    orders: 'Orders',
    inventory: 'Inventory',
    reports: 'Reports',
    social: 'Social',
    leads: 'Leads',
    supplies: 'Supplies',
    partners: 'Partners',
    catalog: 'Catalog',
    settings: 'Settings',
};

function getBreadcrumbItems(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [];
    const items = [];
    let href = '';
    for (let i = 0; i < segments.length; i++) {
        href += '/' + segments[i];
        const segment = segments[i];
        const label =
            PATH_LABELS[segment] ??
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        items.push({ href, label, isLast: i === segments.length - 1 });
    }
    if (items.length === 1 && items[0].href === '/admin') {
        items[0].label = 'Admin';
        items.push({ href: '/admin', label: 'Overview', isLast: true });
        items[0].isLast = false;
    }
    return items;
}

export function Breadcrumb({ pathname, className }) {
    const items = React.useMemo(() => getBreadcrumbItems(pathname), [pathname]);
    if (items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex items-center gap-1.5 text-sm', className)}
        >
            {items.map((item, i) => (
                <React.Fragment key={item.href}>
                    {i > 0 && (
                        <ChevronRight
                            className="size-3.5 shrink-0 text-zinc-600"
                            aria-hidden
                        />
                    )}
                    {item.isLast ? (
                        <span className="font-medium text-zinc-200">
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            href={item.href}
                            className="text-zinc-500 transition-colors hover:text-zinc-300"
                        >
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
