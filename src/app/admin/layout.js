'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Box,
    Users2,
    ShoppingBag,
    Settings,
    ExternalLink,
    Search,
    ScrollText,
    Wrench,
    FileText,
    BarChart2,
    DollarSign,
    Share2,
    UserPlus,
    Flame,
    User,
    LogOut,
    Wallet,
    PieChart,
    Handshake,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useClerk } from '@clerk/nextjs';
const MOCK_LOGS = [
    { id: 1, type: 'success', msg: 'Stripe webhook: checkout.session.completed', time: '2m ago' },
    { id: 2, type: 'error', msg: 'Sentry: Unhandled promise rejection in CartSideBar', time: '15m ago' },
    { id: 3, type: 'success', msg: 'PostHog: Page view /products tracked', time: '22m ago' },
    { id: 4, type: 'info', msg: 'Database: Connection pool refreshed', time: '1h ago' },
    { id: 5, type: 'error', msg: 'Stripe webhook: Rate limit exceeded (retry scheduled)', time: '2h ago' },
];

const navSections = [
    {
        title: 'Analytics',
        icon: BarChart2,
        items: [
            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
            { href: '/admin/reports', label: 'Reports', icon: FileText },
        ],
    },
    {
        title: 'Finance',
        icon: DollarSign,
        items: [
            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
            { href: '/admin/expenses', label: 'Expenses', icon: ScrollText },
            { href: '/admin/payouts', label: 'Promoters / Payouts', icon: Wallet },
            { href: '/admin/pnl', label: 'P&L Summary', icon: PieChart },
        ],
    },
    {
        title: 'Partners',
        icon: Handshake,
        items: [{ href: '/admin/partners', label: 'Partners', icon: Users2 }],
    },
    {
        title: 'Socials',
        icon: Share2,
        items: [{ href: '/admin/social', label: 'Social', icon: Share2 }],
    },
    {
        title: 'Leads',
        icon: UserPlus,
        items: [{ href: '/admin/leads', label: 'Leads', icon: UserPlus }],
    },
    {
        title: 'Operations',
        icon: Box,
        items: [
            { href: '/admin/production', label: 'Production', icon: Flame },
            { href: '/admin/inventory', label: 'Inventory', icon: Box },
            { href: '/admin/supplies', label: 'Supplies', icon: Wrench },
            { href: '/admin/catalog', label: 'Catalog', icon: Package },
        ],
    },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isHovering, setIsHovering] = useState(false);
    const [hoveredSection, setHoveredSection] = useState(null);
    const [isUserPopoutOpen, setIsUserPopoutOpen] = useState(false);

    const { signOut } = useClerk();

    const sectionContainingCurrentPage = navSections.find((s) =>
        s.items.some(({ href }) => pathname === href || (href !== '/admin' && pathname.startsWith(href))),
    )?.title;
    const effectiveSection = hoveredSection ?? sectionContainingCurrentPage ?? navSections[0]?.title;
    const showItemsDrawer = isHovering && effectiveSection && !isUserPopoutOpen;

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen bg-zinc-950" data-admin-layout>
                {/* Sidebar: icon bar + items drawer on section hover */}
                <div
                    className="fixed left-0 top-0 bottom-0 z-40 flex"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        setHoveredSection(null);
                        setIsUserPopoutOpen(false);
                    }}
                >
                    {/* Unified sidebar: icon bar + drawer as one continuous panel */}
                    <div
                        className={cn(
                            'relative flex border-r border-zinc-800 bg-zinc-900/95 backdrop-blur-xl transition-all duration-200',
                            showItemsDrawer ? 'w-[17rem]' : 'w-20',
                        )}
                    >
                        <aside
                            className={cn(
                                'flex h-full w-20 shrink-0 flex-col p-2',
                                showItemsDrawer && 'border-r border-zinc-800',
                            )}
                        >
                            <div className="mb-4 flex items-center justify-center py-2">
                                <span className="text-zinc-100 text-sm font-bold">CS</span>
                            </div>
                            <nav className="flex flex-1 flex-col gap-3">
                                {navSections.map(({ title, icon: SectionIcon }) => {
                                    const isHovered = hoveredSection === title;
                                    const hasActiveChild = navSections
                                        .find((s) => s.title === title)
                                        ?.items.some(
                                            ({ href }) =>
                                                pathname === href || (href !== '/admin' && pathname.startsWith(href)),
                                        );
                                    return (
                                        <Tooltip key={title}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    onMouseEnter={() => setHoveredSection(title)}
                                                    className={cn(
                                                        'flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-colors cursor-default',
                                                        isHovered || hasActiveChild
                                                            ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                                                            : 'text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-100',
                                                    )}
                                                >
                                                    <SectionIcon className="size-4 shrink-0" />
                                                    <span className="max-w-[72px] truncate text-center text-[9px] leading-tight">
                                                        {title}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                className="bg-zinc-800 text-zinc-100 border-zinc-700"
                                            >
                                                {title}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </nav>
                            <div
                                className="border-t border-zinc-800/80 pt-3"
                                onMouseEnter={() => setHoveredSection('Admin')}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsUserPopoutOpen((prev) => !prev);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setIsUserPopoutOpen((prev) => !prev);
                                                }
                                            }}
                                            className={cn(
                                                'flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-zinc-400 transition-colors cursor-pointer',
                                                (hoveredSection === 'Admin' || isUserPopoutOpen) &&
                                                    'bg-zinc-700/70 text-zinc-100',
                                            )}
                                        >
                                            <User className="size-4 shrink-0" />
                                            <span className="text-[9px] leading-tight text-center">Admin</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-zinc-800 text-zinc-100 border-zinc-700">
                                        Admin
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </aside>

                        {/* Section drawer - slightly different tone from icon bar */}
                        {showItemsDrawer && effectiveSection && (
                            <div
                                className="flex h-full w-48 shrink-0 flex-col bg-zinc-800/40"
                                onMouseEnter={() => {
                                    if (!hoveredSection) setHoveredSection(effectiveSection);
                                }}
                            >
                                <div className="border-b border-zinc-800 px-4 py-3">
                                    <span className="text-zinc-200 text-sm font-medium">{effectiveSection}</span>
                                </div>
                                <nav className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
                                    {effectiveSection === 'Admin' ? (
                                        <>
                                            <Link
                                                href="/admin/settings"
                                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-zinc-100"
                                            >
                                                <Settings className="size-3.5 shrink-0" />
                                                Settings
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await signOut();
                                                    router.push('/');
                                                }}
                                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-red-400"
                                            >
                                                <LogOut className="size-3.5 shrink-0" />
                                                Sign out
                                            </button>
                                        </>
                                    ) : (
                                        navSections
                                            .find((s) => s.title === effectiveSection)
                                            ?.items.map(({ href, label, icon: Icon }) => {
                                                const isActive =
                                                    pathname === href ||
                                                    (href !== '/admin' && pathname.startsWith(href));
                                                return (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        className={cn(
                                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                                                            isActive
                                                                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                                                                : 'text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-100',
                                                        )}
                                                    >
                                                        <Icon className="size-3.5 shrink-0" />
                                                        {label}
                                                    </Link>
                                                );
                                            })
                                    )}
                                </nav>
                            </div>
                        )}
                        {/* User popout - overlays the drawer */}
                        {isUserPopoutOpen && (
                            <div
                                className="absolute left-20 bottom-8 z-50 flex w-48 flex-col rounded-lg border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur-xl"
                                onMouseEnter={() => setIsUserPopoutOpen(true)}
                                onMouseLeave={() => setIsUserPopoutOpen(false)}
                            >
                                <div className="border-b border-zinc-800 px-4 py-3">
                                    <p className="text-xs font-medium text-zinc-200">Admin</p>
                                    <p className="text-[10px] text-zinc-500">Carne Seca</p>
                                </div>
                                <div className="flex flex-col gap-0.5 p-2">
                                    <Link
                                        href="/admin/settings"
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-zinc-100"
                                    >
                                        <Settings className="size-4 shrink-0" />
                                        Settings
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await signOut();
                                            router.push('/');
                                        }}
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-red-400"
                                    >
                                        <LogOut className="size-4 shrink-0" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content area - fixed margin, sidebar overlays when expanded */}
                <main className="min-h-screen ml-20">
                    {/* Top Header with Command-K search + Status Bar + Live Site */}
                    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/90 px-6 backdrop-blur-md">
                        {/* Command-K style search */}
                        <div className="flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                                <Input
                                    placeholder="Search… (⌘K)"
                                    className="h-9 w-full border-zinc-800 bg-zinc-900/80 pl-9 text-sm text-zinc-100 placeholder:text-zinc-500"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* System Status Bar + Recent Logs */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-3 rounded-lg border-[0.5px] border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
                                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <span className="relative flex size-1.5">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Stripe
                                </span>
                                <span className="h-3 w-px bg-zinc-700" />
                                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <span className="relative flex size-1.5">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                                    </span>
                                    DB
                                </span>
                                <span className="h-3 w-px bg-zinc-700" />
                                <a
                                    href="https://eddwordd.sentry.io/issues/?project=4510999211147344"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] text-zinc-400 transition-colors hover:text-zinc-200"
                                >
                                    <span className="relative flex size-1.5 rounded-full bg-red-500" />
                                    <span>0 errors in last 24h</span>
                                    <ExternalLink className="size-2.5 opacity-60" />
                                </a>
                            </div>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                    >
                                        <ScrollText className="size-3.5" />
                                        Logs
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-full max-w-sm border-zinc-800 bg-zinc-900 sm:max-w-md"
                                >
                                    <SheetHeader>
                                        <SheetTitle className="text-sm">Recent Logs</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4 space-y-1 overflow-y-auto">
                                        {MOCK_LOGS.map((log) => (
                                            <div
                                                key={log.id}
                                                className={cn(
                                                    'rounded-md border px-3 py-2 text-[11px]',
                                                    log.type === 'error' && 'border-red-500/20 bg-red-500/5',
                                                    log.type === 'success' && 'border-emerald-500/20 bg-emerald-500/5',
                                                    log.type === 'info' && 'border-zinc-700 bg-zinc-900/60',
                                                )}
                                            >
                                                <p className="text-zinc-200 font-medium">{log.msg}</p>
                                                <p className="text-zinc-500 mt-1">{log.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Live Site toggle */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border-[0.5px] border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20"
                        >
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            Live Site
                            <ExternalLink className="size-3" />
                        </a>
                    </header>

                    {/* Page content */}
                    <div className="bg-zinc-950 p-6">
                        <Breadcrumb pathname={pathname} className="mb-4" />
                        {children}
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
