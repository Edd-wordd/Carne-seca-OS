"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    ChevronsLeft,
    ChevronsRight,
    ChevronRight,
    Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
const MOCK_LOGS = [
    { id: 1, type: "success", msg: "Stripe webhook: checkout.session.completed", time: "2m ago" },
    { id: 2, type: "error", msg: "Sentry: Unhandled promise rejection in CartSideBar", time: "15m ago" },
    { id: 3, type: "success", msg: "PostHog: Page view /products tracked", time: "22m ago" },
    { id: 4, type: "info", msg: "Database: Connection pool refreshed", time: "1h ago" },
    { id: 5, type: "error", msg: "Stripe webhook: Rate limit exceeded (retry scheduled)", time: "2h ago" },
];

const navSections = [
    {
        title: "Analytics",
        icon: BarChart2,
        items: [
            { href: "/admin", label: "Overview", icon: LayoutDashboard },
            { href: "/admin/reports", label: "Reports", icon: FileText },
        ],
    },
    {
        title: "Finance",
        icon: DollarSign,
        items: [
            { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        ],
    },
    {
        title: "Social Platforms",
        icon: Share2,
        items: [
            { href: "/admin/social", label: "Social", icon: Share2 },
        ],
    },
    {
        title: "Lead Generator",
        icon: UserPlus,
        items: [
            { href: "/admin/leads", label: "Leads", icon: UserPlus },
        ],
    },
    {
        title: "Operations",
        icon: Box,
        items: [
            { href: "/admin/production", label: "Production", icon: Flame },
            { href: "/admin/inventory", label: "Inventory", icon: Box },
            { href: "/admin/supplies", label: "Supplies", icon: Wrench },
            { href: "/admin/partners", label: "Partners", icon: Users2 },
            { href: "/admin/catalog", label: "Catalog", icon: Package },
        ],
    },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() => {
        return navSections.map(s => s.title);
    });

    useEffect(() => {
        const savedCollapsed = localStorage.getItem("admin-sidebar-collapsed");
        if (savedCollapsed !== null) setCollapsed(savedCollapsed === "true");
        
        const savedExpanded = localStorage.getItem("admin-sidebar-expanded");
        if (savedExpanded) {
            try {
                setExpandedSections(JSON.parse(savedExpanded));
            } catch {}
        }
    }, []);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem("admin-sidebar-collapsed", String(next));
    };

    const toggleSection = (title) => {
        setExpandedSections(prev => {
            const next = prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title];
            localStorage.setItem("admin-sidebar-expanded", JSON.stringify(next));
            return next;
        });
    };

    const isSectionExpanded = (title) => expandedSections.includes(title);

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen bg-zinc-950" data-admin-layout>
                {/* Sidebar - flush to side */}
                <aside
                    className={cn(
                        "fixed left-0 top-0 bottom-0 z-40 border-r border-zinc-800 bg-zinc-900/90 backdrop-blur-xl transition-all duration-300",
                        collapsed ? "w-16" : "w-52"
                    )}
                >
                    <div className="flex h-full flex-col p-4">
                        {/* Header */}
                        <div className={cn(
                            "mb-6 flex",
                            collapsed ? "flex-col items-center gap-2" : "items-center justify-between"
                        )}>
                            <div className={cn("py-2", collapsed ? "px-0" : "px-1")}>
                                {collapsed ? (
                                    <span className="text-zinc-100 text-sm font-bold">CS</span>
                                ) : (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-zinc-100 text-sm font-semibold tracking-tight">
                                            Admin
                                        </span>
                                        <span className="text-zinc-500 text-[10px] font-medium">
                                            Carne Seca
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={toggleCollapsed}
                                className="flex items-center justify-center size-7 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {collapsed ? (
                                    <ChevronsRight className="size-4" />
                                ) : (
                                    <ChevronsLeft className="size-4" />
                                )}
                            </button>
                        </div>

                        {/* Nav */}
                        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
                            {navSections.map(({ title, icon: SectionIcon, items }) => {
                                const isExpanded = isSectionExpanded(title);
                                const hasActiveChild = items.some(
                                    ({ href }) => pathname === href || (href !== "/admin" && pathname.startsWith(href))
                                );

                                if (collapsed) {
                                    return (
                                        <div key={title} className="flex flex-col gap-0.5">
                                            {items.map(({ href, label, icon: Icon }) => {
                                                const isActive =
                                                    pathname === href ||
                                                    (href !== "/admin" && pathname.startsWith(href));
                                                
                                                return (
                                                    <Tooltip key={href}>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={href}
                                                                className={cn(
                                                                    "flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                                                                    isActive
                                                                        ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
                                                                        : "text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-100"
                                                                )}
                                                            >
                                                                <Icon className="size-3.5 shrink-0" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="bg-zinc-800 text-zinc-100 border-zinc-700">
                                                            {label}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={title}>
                                        <button
                                            onClick={() => toggleSection(title)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors",
                                                hasActiveChild && !isExpanded
                                                    ? "text-indigo-300"
                                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                            )}
                                        >
                                            <ChevronRight
                                                className={cn(
                                                    "size-3 shrink-0 transition-transform duration-200",
                                                    isExpanded && "rotate-90"
                                                )}
                                            />
                                            <SectionIcon className="size-3.5 shrink-0" />
                                            <span className="text-xs font-medium">
                                                {title}
                                            </span>
                                        </button>
                                        <div
                                            className={cn(
                                                "overflow-hidden transition-all duration-200",
                                                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                            )}
                                        >
                                            <div className="relative ml-[18px] mt-1">
                                                {/* Tree line */}
                                                <div className="absolute left-0 top-0 bottom-2 w-px bg-zinc-700/50" />
                                                <div className="flex flex-col gap-0.5">
                                                    {items.map(({ href, label, icon: Icon }, idx) => {
                                                        const isActive =
                                                            pathname === href ||
                                                            (href !== "/admin" && pathname.startsWith(href));
                                                        const isLast = idx === items.length - 1;
                                                        
                                                        return (
                                                            <div key={href} className="relative flex items-center">
                                                                {/* Branch line */}
                                                                <div className={cn(
                                                                    "absolute left-0 w-3 border-zinc-700/50",
                                                                    isLast 
                                                                        ? "top-1/2 h-0 border-t rounded-bl" 
                                                                        : "top-1/2 h-0 border-t"
                                                                )} />
                                                                <Link
                                                                    href={href}
                                                                    className={cn(
                                                                        "flex items-center gap-2.5 rounded-lg ml-5 px-3 py-1.5 text-xs font-medium transition-colors flex-1",
                                                                        isActive
                                                                            ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
                                                                            : "text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-100"
                                                                    )}
                                                                >
                                                                    <Icon className="size-3.5 shrink-0" />
                                                                    {label}
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="border-t border-zinc-800/80 pt-3">
                            {collapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href="/admin/settings"
                                            className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-zinc-100"
                                        >
                                            <Settings className="size-3.5 shrink-0" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-zinc-800 text-zinc-100 border-zinc-700">
                                        Settings
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Link
                                    href="/admin/settings"
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700/70 hover:text-zinc-100"
                                >
                                    <Settings className="size-3.5 shrink-0" />
                                    Settings
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main content area */}
                <main className={cn(
                    "min-h-screen transition-all duration-300",
                    collapsed ? "ml-16" : "ml-52"
                )}>
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
                            <SheetContent side="right" className="w-full max-w-sm border-zinc-800 bg-zinc-900 sm:max-w-md">
                                <SheetHeader>
                                    <SheetTitle className="text-sm">Recent Logs</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4 space-y-1 overflow-y-auto">
                                    {MOCK_LOGS.map((log) => (
                                        <div
                                            key={log.id}
                                            className={cn(
                                                "rounded-md border px-3 py-2 text-[11px]",
                                                log.type === "error" && "border-red-500/20 bg-red-500/5",
                                                log.type === "success" && "border-emerald-500/20 bg-emerald-500/5",
                                                log.type === "info" && "border-zinc-700 bg-zinc-900/60"
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
                    <div className="bg-zinc-950 p-6">{children}</div>
                </main>
            </div>
        </TooltipProvider>
    );
}
