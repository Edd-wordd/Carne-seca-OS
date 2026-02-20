'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    UserPlus,
    Search,
    Filter,
    Mail,
    Phone,
    Building2,
    MapPin,
    CheckCircle2,
    Clock,
    Send,
    Bot,
    Download,
    ChevronLeft,
    ChevronRight,
    Plus,
    Link2,
    FileUp,
    MessageSquare,
    UserCheck,
    XCircle,
    Check,
    Copy,
    Eye,
    EyeOff,
    Webhook,
    LogOut,
    RefreshCw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const LEAD_STATUSES = [
    { value: 'combed_through', label: 'Combed Through', icon: Bot },
    { value: 'validated', label: 'Validated', icon: CheckCircle2 },
    { value: 'ready_to_contact', label: 'Ready to Contact', icon: Send },
    { value: 'contacted', label: 'Contacted', icon: MessageSquare },
    { value: 'qualified', label: 'Qualified', icon: UserCheck },
    { value: 'converted', label: 'Converted', icon: Check },
    { value: 'lost', label: 'Lost', icon: XCircle },
];

const LEAD_SOURCES = [
    'Instagram DM',
    'Website form',
    'Facebook lead ad',
    'Trade show',
    'Referral',
    'LinkedIn InMail',
    'Google Ads',
];

const EMAIL_TEMPLATES = [
    { id: 'intro', name: 'Intro / Cold outreach' },
    { id: 'followup', name: 'Follow-up' },
    { id: 'wholesale', name: 'Wholesale inquiry response' },
];

const MOCK_LEADS = [
    {
        id: 'L-1',
        name: 'Maria Chen',
        email: 'maria.chen@texasbbq.com',
        phone: '(512) 555-0142',
        company: 'Texas BBQ House',
        role: 'Owner',
        address: '450 Main St, Austin, TX 78701',
        source: 'Instagram DM',
        notes: 'Interested in wholesale. Asked about minimum order.',
        status: 'ready_to_contact',
        combedAt: '2025-02-18T10:30',
        validatedAt: '2025-02-18T14:00',
        nextFollowUp: null,
        contactLog: [],
    },
    {
        id: 'L-2',
        name: 'James Rodriguez',
        email: 'j.rodriguez@smokehouse.co',
        phone: '(713) 555-0891',
        company: 'Houston Smokehouse',
        role: 'Purchasing Manager',
        address: '1200 Commerce Blvd, Houston, TX 77002',
        source: 'Website form',
        notes: 'Filled out B2B inquiry. High intent.',
        status: 'ready_to_contact',
        combedAt: '2025-02-17T09:15',
        validatedAt: '2025-02-17T11:45',
        nextFollowUp: null,
        contactLog: [],
    },
    {
        id: 'L-3',
        name: 'Sarah Kim',
        email: 'sarah@farmtotable.sa',
        phone: '(210) 555-0321',
        company: 'Farm & Table SA',
        role: 'Owner',
        address: null,
        source: 'Facebook lead ad',
        notes: 'Local farm store. AI flagged as good fit.',
        status: 'validated',
        combedAt: '2025-02-18T08:00',
        validatedAt: '2025-02-18T08:05',
        nextFollowUp: null,
        contactLog: [],
    },
    {
        id: 'L-4',
        name: 'David Park',
        email: 'david.park@gmail.com',
        phone: null,
        company: null,
        role: null,
        address: null,
        source: 'Trade show scan',
        notes: 'Collected at Austin Food & Wine. Needs validation.',
        status: 'combed_through',
        combedAt: '2025-02-18T16:22',
        validatedAt: null,
        nextFollowUp: null,
        contactLog: [],
    },
    {
        id: 'L-5',
        name: 'Lisa Thompson',
        email: 'lisa@uptownmeats.com',
        phone: '(214) 555-0678',
        company: 'Uptown Meats Dallas',
        role: 'GM',
        address: '890 Oak Ave, Dallas, TX 75201',
        source: 'Referral - Downtown Provisions',
        notes: 'Referred by M. Chen. Hot lead.',
        status: 'contacted',
        combedAt: '2025-02-16T11:00',
        validatedAt: '2025-02-16T14:30',
        nextFollowUp: '2025-02-25',
        contactLog: [{ id: 'c1', date: '2025-02-18', type: 'email', summary: 'Sent intro email' }],
    },
    {
        id: 'L-6',
        name: 'Robert Martinez',
        email: 'rmartinez@restaurant.com',
        phone: '(512) 555-0199',
        company: null,
        role: null,
        address: null,
        source: 'LinkedIn InMail',
        notes: 'Generic inquiry. AI combing in progress.',
        status: 'combed_through',
        combedAt: '2025-02-18T15:00',
        validatedAt: null,
        nextFollowUp: null,
        contactLog: [],
    },
];

const PAGE_SIZE = 5;

const MOCK_WEBHOOK_LOGS = [
    { id: '1', ts: '2025-02-19T14:32:01Z', status: 200, payload: { name: 'Jane Doe', email: 'jane@example.com' } },
    { id: '2', ts: '2025-02-19T13:18:44Z', status: 200, payload: { name: 'John Smith', source: 'Instagram' } },
    { id: '3', ts: '2025-02-19T11:05:22Z', status: 400, payload: { error: 'Missing email' } },
];

const OUTBOUND_EVENTS = [
    { id: 'lead.created', label: 'Lead created' },
    { id: 'lead.status_changed', label: 'Lead status changed' },
    { id: 'lead.converted', label: 'Lead converted to partner' },
];

const SAMPLE_PAYLOAD = `{
  "name": "Maria Chen",
  "email": "maria@texasbbq.com",
  "phone": "(512) 555-0142",
  "company": "Texas BBQ House",
  "source": "Website form",
  "notes": "Wholesale inquiry"
}`;

export default function LeadsPage() {
    const [leads, setLeads] = React.useState(MOCK_LEADS);
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [selectedLead, setSelectedLead] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [selectedIds, setSelectedIds] = React.useState(new Set());
    const [addLeadOpen, setAddLeadOpen] = React.useState(false);
    const [addLeadForm, setAddLeadForm] = React.useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        address: '',
        source: 'Manual',
        notes: '',
    });
    const [makeContactOpen, setMakeContactOpen] = React.useState(false);
    const [newContactEntry, setNewContactEntry] = React.useState({ type: 'email', summary: '' });
    const [webhookModalOpen, setWebhookModalOpen] = React.useState(false);
    const [apiKeyVisible, setApiKeyVisible] = React.useState(false);
    const [testWebhookStatus, setTestWebhookStatus] = React.useState(null);
    const [outboundUrls, setOutboundUrls] = React.useState(Object.fromEntries(OUTBOUND_EVENTS.map((e) => [e.id, ''])));
    const webhookUrl = 'https://yoursite.com/api/webhooks/leads';
    const placeholderApiKey = '';

    const stats = React.useMemo(() => {
        const combed = leads.filter((l) => l.status === 'combed_through').length;
        const validated = leads.filter((l) => l.status === 'validated').length;
        const ready = leads.filter((l) => l.status === 'ready_to_contact').length;
        const contacted = leads.filter((l) => l.status === 'contacted').length;
        const qualified = leads.filter((l) => l.status === 'qualified').length;
        const converted = leads.filter((l) => l.status === 'converted').length;
        const lost = leads.filter((l) => l.status === 'lost').length;
        return { combed, validated, ready, contacted, qualified, converted, lost, total: leads.length };
    }, [leads]);

    const filteredLeads = React.useMemo(() => {
        let result = leads;
        if (statusFilter !== 'all') {
            result = result.filter((l) => l.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(
                (l) =>
                    (l.name && l.name.toLowerCase().includes(q)) ||
                    (l.email && l.email.toLowerCase().includes(q)) ||
                    (l.company && l.company.toLowerCase().includes(q)) ||
                    (l.source && l.source.toLowerCase().includes(q)),
            );
        }
        return result;
    }, [leads, statusFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedLeads = filteredLeads.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    React.useEffect(() => setPage(1), [statusFilter, search]);

    const updateLeadStatus = (leadId, newStatus) => {
        setLeads((prev) =>
            prev.map((l) =>
                l.id === leadId
                    ? {
                          ...l,
                          status: newStatus,
                          ...(newStatus === 'validated' && {
                              validatedAt: new Date().toISOString().slice(0, 16),
                          }),
                      }
                    : l,
            ),
        );
        if (selectedLead?.id === leadId) {
            setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
    };

    const updateLead = (leadId, updates) => {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l)));
        if (selectedLead?.id === leadId) {
            setSelectedLead((prev) => (prev ? { ...prev, ...updates } : null));
        }
    };

    const addContactLogEntry = (leadId, entry) => {
        const newEntry = {
            id: `c-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            ...entry,
        };
        setLeads((prev) =>
            prev.map((l) =>
                l.id === leadId
                    ? {
                          ...l,
                          contactLog: [...(l.contactLog || []), newEntry],
                      }
                    : l,
            ),
        );
        if (selectedLead?.id === leadId) {
            setSelectedLead((prev) =>
                prev
                    ? {
                          ...prev,
                          contactLog: [...(prev.contactLog || []), newEntry],
                      }
                    : null,
            );
        }
        setNewContactEntry({ type: 'email', summary: '' });
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const ids = paginatedLeads.map((l) => l.id);
        const allSelected = ids.every((id) => selectedIds.has(id));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
            return next;
        });
    };

    const bulkUpdateStatus = (newStatus) => {
        setLeads((prev) =>
            prev.map((l) =>
                selectedIds.has(l.id)
                    ? {
                          ...l,
                          status: newStatus,
                          ...(newStatus === 'validated' && {
                              validatedAt: new Date().toISOString().slice(0, 16),
                          }),
                      }
                    : l,
            ),
        );
        setSelectedIds(new Set());
    };

    const handleAddLead = (e) => {
        e.preventDefault();
        const f = addLeadForm;
        const lead = {
            id: `L-${Date.now()}`,
            name: f.name || '',
            email: f.email || '',
            phone: f.phone || null,
            company: f.company || null,
            role: f.role || null,
            address: f.address || null,
            source: f.source || 'Manual',
            notes: f.notes || '',
            status: 'combed_through',
            combedAt: new Date().toISOString().slice(0, 16),
            validatedAt: null,
            nextFollowUp: null,
            contactLog: [],
        };
        setLeads((prev) => [lead, ...prev]);
        setAddLeadOpen(false);
        setAddLeadForm({
            name: '',
            email: '',
            phone: '',
            company: '',
            role: '',
            address: '',
            source: 'Manual',
            notes: '',
        });
    };

    const formatDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime())
            ? d
            : dt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              });
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    };

    const handleTestWebhook = () => {
        setTestWebhookStatus('sending');
        setTimeout(() => setTestWebhookStatus('success'), 800);
        setTimeout(() => setTestWebhookStatus(null), 3000);
    };

    const formatDateTime = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime())
            ? d
            : dt.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
              });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'combed_through':
                return 'border border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
            case 'validated':
                return 'border border-indigo-600/50 bg-indigo-500/10 text-indigo-400';
            case 'ready_to_contact':
                return 'border border-emerald-600/50 bg-emerald-500/10 text-emerald-400';
            case 'contacted':
                return 'border border-amber-600/50 bg-amber-500/10 text-amber-400';
            case 'qualified':
                return 'border border-blue-600/50 bg-blue-500/10 text-blue-400';
            case 'converted':
                return 'border border-emerald-700/50 bg-emerald-600/20 text-emerald-300';
            case 'lost':
                return 'border border-red-600/50 bg-red-500/10 text-red-400';
            default:
                return 'border border-zinc-600/50 bg-zinc-800/50 text-zinc-400';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Lead Generator</h1>
                    <p className="mt-0.5 text-xs text-zinc-500">AI-combed leads · Validate & make contact</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 text-xs"
                    >
                        <Download className="size-3.5" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        onClick={() => setAddLeadOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Ingestion & Integrations */}
            <div className="rounded border border-zinc-700/80 bg-zinc-900/60 p-4">
                <h2 className="text-xs font-medium text-zinc-300">Lead ingestion & integrations</h2>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                    Connect webhooks, import, and outbound events (UI only — no backend)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-[10px]"
                        onClick={() => setWebhookModalOpen(true)}
                    >
                        <Link2 className="size-3" />
                        Connect Webhook
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-[10px]"
                    >
                        <FileUp className="size-3" />
                        Import CSV
                    </Button>
                </div>

                <Tabs defaultValue="inbound" className="mt-4">
                    <TabsList className="h-8 border-zinc-700 bg-zinc-950">
                        <TabsTrigger value="inbound" className="h-7 text-[10px] data-[state=active]:bg-zinc-800">
                            <Webhook className="size-3 mr-1" />
                            Inbound logs
                        </TabsTrigger>
                        <TabsTrigger value="outbound" className="h-7 text-[10px] data-[state=active]:bg-zinc-800">
                            <LogOut className="size-3 mr-1" />
                            Outbound webhooks
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="inbound" className="mt-3">
                        <div className="rounded border border-zinc-700/60 bg-zinc-950/50 overflow-hidden">
                            <div className="border-b border-zinc-700/60 px-3 py-2 text-[10px] font-medium text-zinc-500">
                                Recent webhook requests (mock)
                            </div>
                            <div className="max-h-32 overflow-y-auto">
                                {MOCK_WEBHOOK_LOGS.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-3 border-b border-zinc-800/80 px-3 py-2 last:border-0"
                                    >
                                        <span className="text-[10px] text-zinc-500 shrink-0">
                                            {new Date(log.ts).toLocaleString()}
                                        </span>
                                        <span
                                            className={cn(
                                                'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                                                log.status === 200
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-red-500/20 text-red-400',
                                            )}
                                        >
                                            {log.status}
                                        </span>
                                        <code className="truncate text-[10px] text-zinc-400">
                                            {JSON.stringify(log.payload).slice(0, 60)}…
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="outbound" className="mt-3 space-y-2">
                        <p className="text-[10px] text-zinc-500">
                            Configure URLs to receive events (UI only — no requests sent)
                        </p>
                        {OUTBOUND_EVENTS.map((ev) => (
                            <div key={ev.id} className="flex items-center gap-2">
                                <Label className="w-36 shrink-0 text-[10px] text-zinc-400">{ev.label}</Label>
                                <Input
                                    placeholder="https://..."
                                    value={outboundUrls[ev.id] || ''}
                                    onChange={(e) => setOutboundUrls((prev) => ({ ...prev, [ev.id]: e.target.value }))}
                                    className="h-7 flex-1 border-zinc-700 bg-zinc-950 text-[10px] font-mono"
                                />
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Funnel / Summary Cards */}
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Bot className="size-4 shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Combed</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.combed}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-indigo-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Validated</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.validated}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Send className="size-4 shrink-0 text-emerald-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Ready</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.ready}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <MessageSquare className="size-4 shrink-0 text-amber-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Contacted</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.contacted}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <UserCheck className="size-4 shrink-0 text-blue-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Qualified</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.qualified}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <Check className="size-4 shrink-0 text-emerald-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Converted</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.converted}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <XCircle className="size-4 shrink-0 text-red-400/80" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Lost</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.lost}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded border border-zinc-700/80 bg-zinc-900/60 px-3 py-2.5">
                    <UserPlus className="size-4 shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                        <p className="truncate text-[10px] text-zinc-400">Total</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-100">{stats.total}</p>
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div className="overflow-hidden rounded border border-zinc-700/80 bg-zinc-900/60">
                <div className="flex flex-col gap-3 border-b border-zinc-700/80 bg-zinc-900/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[140px] max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search leads…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 border-zinc-700 bg-zinc-950 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 w-[140px] border-zinc-700 bg-zinc-950 text-zinc-100 text-[10px]">
                                <Filter className="size-3 mr-1" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All
                                </SelectItem>
                                {LEAD_STATUSES.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="text-xs">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 border-b border-zinc-700/60 bg-zinc-800/40 px-3 py-2">
                        <span className="text-[10px] text-zinc-400">{selectedIds.size} selected</span>
                        <Select onValueChange={(v) => bulkUpdateStatus(v)}>
                            <SelectTrigger className="h-7 w-[140px] border-zinc-700 bg-zinc-900 text-[10px]">
                                <SelectValue placeholder="Change status…" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEAD_STATUSES.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="text-xs">
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-zinc-400"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="h-8 w-8 px-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedIds.has(l.id))
                                    }
                                    onChange={toggleSelectAll}
                                    className="rounded border-zinc-600 bg-zinc-900"
                                />
                            </TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Name</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Company</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Contact</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Source</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Status</TableHead>
                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Next follow-up</TableHead>
                            <TableHead className="h-8 w-20 px-3 text-[10px] text-zinc-500" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedLeads.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={8} className="py-12 text-center text-sm text-zinc-500">
                                    No leads match your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedLeads.map((lead) => (
                                <TableRow
                                    key={lead.id}
                                    className="group cursor-pointer border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                    onClick={() => setSelectedLead(lead)}
                                >
                                    <TableCell className="w-8 px-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(lead.id)}
                                            onChange={() => toggleSelect(lead.id)}
                                            className="rounded border-zinc-600 bg-zinc-900"
                                        />
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] font-medium text-zinc-200 group-hover:text-zinc-100">
                                        {lead.name}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400 group-hover:text-zinc-300">
                                        {lead.company ?? '—'}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400 group-hover:text-zinc-300">
                                        {lead.email ?? lead.phone ?? '—'}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400 group-hover:text-zinc-300">
                                        {lead.source ?? '—'}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <span
                                            className={cn(
                                                'inline-flex rounded px-2 py-0.5 text-[10px] font-medium',
                                                getStatusStyle(lead.status),
                                            )}
                                        >
                                            {LEAD_STATUSES.find((s) => s.value === lead.status)?.label ?? lead.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">
                                        {lead.nextFollowUp ? formatDate(lead.nextFollowUp) : '—'}
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedLead(lead);
                                            }}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-zinc-700/80 px-3 py-2">
                        <p className="text-[10px] text-zinc-500">
                            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 border-zinc-700 px-2 text-[10px]"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                            >
                                <ChevronLeft className="size-3" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 border-zinc-700 px-2 text-[10px]"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage >= totalPages}
                            >
                                Next <ChevronRight className="size-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Lead Modal */}
            <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
                <DialogContent className="max-w-md border-zinc-800 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle>Add Lead</DialogTitle>
                        <DialogDescription>Manual entry — webhook/import coming later</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddLead} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Name</Label>
                                <Input
                                    value={addLeadForm.name}
                                    onChange={(e) => setAddLeadForm((p) => ({ ...p, name: e.target.value }))}
                                    className="h-8"
                                    placeholder="Jane Smith"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Email</Label>
                                <Input
                                    value={addLeadForm.email}
                                    onChange={(e) => setAddLeadForm((p) => ({ ...p, email: e.target.value }))}
                                    type="email"
                                    className="h-8"
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Phone</Label>
                                <Input
                                    value={addLeadForm.phone}
                                    onChange={(e) => setAddLeadForm((p) => ({ ...p, phone: e.target.value }))}
                                    className="h-8"
                                    placeholder="(512) 555-0000"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Company</Label>
                                <Input
                                    value={addLeadForm.company}
                                    onChange={(e) => setAddLeadForm((p) => ({ ...p, company: e.target.value }))}
                                    className="h-8"
                                    placeholder="Acme Co"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Source</Label>
                            <Select
                                value={addLeadForm.source}
                                onValueChange={(v) => setAddLeadForm((p) => ({ ...p, source: v }))}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Manual', ...LEAD_SOURCES].map((s) => (
                                        <SelectItem key={s} value={s} className="text-xs">
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Notes</Label>
                            <Input
                                value={addLeadForm.notes}
                                onChange={(e) => setAddLeadForm((p) => ({ ...p, notes: e.target.value }))}
                                className="h-8"
                                placeholder="How did you find them?"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddLeadOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
                                Add Lead
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Lead Detail Modal */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-zinc-800 bg-zinc-950">
                    {selectedLead && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-zinc-100">{selectedLead.name}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Status & Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={selectedLead.status}
                                        onValueChange={(v) => updateLeadStatus(selectedLead.id, v)}
                                    >
                                        <SelectTrigger className="h-8 w-[160px] border-zinc-700 bg-zinc-900/80 text-zinc-100 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEAD_STATUSES.map((s) => (
                                                <SelectItem key={s.value} value={s.value} className="text-xs">
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {(selectedLead.status === 'ready_to_contact' ||
                                        selectedLead.status === 'contacted') && (
                                        <Button
                                            size="sm"
                                            className="h-8 gap-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                            onClick={() => setMakeContactOpen(true)}
                                        >
                                            <Send className="size-3.5" />
                                            Make Contact
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 border-zinc-700 text-zinc-400"
                                        onClick={() => {
                                            /* Navigate to add partner with prefilled data — UI placeholder */
                                            window.location.href = '/admin/partners?fromLead=' + selectedLead.id;
                                        }}
                                    >
                                        <UserCheck className="size-3.5" />
                                        Convert to Partner
                                    </Button>
                                </div>

                                {/* Next follow-up */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] text-zinc-500 shrink-0">Next follow-up</Label>
                                    <Input
                                        type="date"
                                        value={selectedLead.nextFollowUp || ''}
                                        onChange={(e) =>
                                            updateLead(selectedLead.id, {
                                                nextFollowUp: e.target.value || null,
                                            })
                                        }
                                        className="h-8 w-36 border-zinc-700 bg-zinc-900/80 text-xs"
                                    />
                                </div>

                                {/* Contact Info */}
                                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 p-4 space-y-3">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                        Contact Information
                                    </h3>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Mail className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                                            <div>
                                                <p className="text-[10px] text-zinc-500">Email</p>
                                                <a
                                                    href={`mailto:${selectedLead.email}`}
                                                    className="text-zinc-200 hover:text-indigo-400"
                                                >
                                                    {selectedLead.email ?? '—'}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Phone className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                                            <div>
                                                <p className="text-[10px] text-zinc-500">Phone</p>
                                                <a
                                                    href={`tel:${selectedLead.phone}`}
                                                    className="text-zinc-200 hover:text-indigo-400"
                                                >
                                                    {selectedLead.phone ?? '—'}
                                                </a>
                                            </div>
                                        </div>
                                        {selectedLead.company && (
                                            <div className="flex items-start gap-2">
                                                <Building2 className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                                                <div>
                                                    <p className="text-[10px] text-zinc-500">Company</p>
                                                    <p className="text-zinc-200">
                                                        {selectedLead.company}
                                                        {selectedLead.role && (
                                                            <span className="text-zinc-500">
                                                                {' '}
                                                                · {selectedLead.role}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedLead.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                                                <div>
                                                    <p className="text-[10px] text-zinc-500">Address</p>
                                                    <p className="text-zinc-200">{selectedLead.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact log */}
                                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 p-4 space-y-3">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                        Contact log
                                    </h3>
                                    {(selectedLead.contactLog || []).length > 0 ? (
                                        <ul className="space-y-2">
                                            {(selectedLead.contactLog || []).map((entry) => (
                                                <li
                                                    key={entry.id}
                                                    className="flex items-start gap-2 rounded border border-zinc-700/60 bg-zinc-950/50 px-2.5 py-1.5 text-[11px]"
                                                >
                                                    <span className="text-zinc-500 shrink-0">
                                                        {formatDate(entry.date)}
                                                    </span>
                                                    <span className="text-zinc-400 font-medium">{entry.type}</span>
                                                    <span className="text-zinc-300">{entry.summary}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-[11px] text-zinc-500">No contact log yet.</p>
                                    )}
                                    <div className="flex flex-wrap items-end gap-2 pt-1">
                                        <Select
                                            value={newContactEntry.type}
                                            onValueChange={(v) => setNewContactEntry((p) => ({ ...p, type: v }))}
                                        >
                                            <SelectTrigger className="h-7 w-24 border-zinc-700 text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email" className="text-xs">
                                                    Email
                                                </SelectItem>
                                                <SelectItem value="call" className="text-xs">
                                                    Call
                                                </SelectItem>
                                                <SelectItem value="meeting" className="text-xs">
                                                    Meeting
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Summary…"
                                            value={newContactEntry.summary}
                                            onChange={(e) =>
                                                setNewContactEntry((p) => ({ ...p, summary: e.target.value }))
                                            }
                                            className="h-7 flex-1 min-w-0 border-zinc-700 text-xs"
                                        />
                                        <Button
                                            size="sm"
                                            className="h-7 text-[10px]"
                                            disabled={!newContactEntry.summary.trim()}
                                            onClick={() => {
                                                addContactLogEntry(selectedLead.id, newContactEntry);
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Source & Timeline */}
                                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 p-4 space-y-2">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                        Source & Timeline
                                    </h3>
                                    <p>
                                        <span className="text-zinc-500">Source: </span>
                                        <span className="text-zinc-200">{selectedLead.source ?? '—'}</span>
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                        <Clock className="size-3.5" />
                                        Combed: {formatDateTime(selectedLead.combedAt)}
                                    </div>
                                    {selectedLead.validatedAt && (
                                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                            <CheckCircle2 className="size-3.5" />
                                            Validated: {formatDateTime(selectedLead.validatedAt)}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 p-4">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                                        Notes
                                    </h3>
                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                                        {selectedLead.notes ?? 'No notes.'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Make Contact Modal — email template picker */}
            <Dialog open={makeContactOpen} onOpenChange={setMakeContactOpen}>
                <DialogContent className="max-w-sm border-zinc-800 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle>Make Contact</DialogTitle>
                        <DialogDescription>Select a template or open email client</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        {EMAIL_TEMPLATES.map((t) => (
                            <Button
                                key={t.id}
                                variant="outline"
                                className="w-full justify-start border-zinc-700 text-zinc-300"
                                onClick={() => {
                                    /* Open mailto or copy template — UI placeholder */
                                    window.location.href = `mailto:${selectedLead?.email}?subject=Carne%20Seca%20Partnership`;
                                    setMakeContactOpen(false);
                                }}
                            >
                                {t.name}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full justify-start border-zinc-700 text-zinc-300"
                            onClick={() => {
                                window.location.href = `mailto:${selectedLead?.email}`;
                                setMakeContactOpen(false);
                            }}
                        >
                            Open email (no template)
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMakeContactOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Connect Webhook Modal — UI only */}
            <Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
                <DialogContent className="max-w-lg border-zinc-800 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle>Connect Webhook</DialogTitle>
                        <DialogDescription>
                            Use this URL to receive leads from n8n, Pipedream, or other tools
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-zinc-400">Webhook URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={webhookUrl}
                                    className="h-8 border-zinc-700 bg-zinc-900/80 font-mono text-[10px] text-zinc-300"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 border-zinc-700 px-2"
                                    onClick={() => copyToClipboard(webhookUrl)}
                                >
                                    <Copy className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-zinc-400">API Key (header: X-API-Key)</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    type={apiKeyVisible ? 'text' : 'password'}
                                    value={placeholderApiKey}
                                    className="h-8 border-zinc-700 bg-zinc-900/80 font-mono text-[10px] text-zinc-300"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 border-zinc-700 px-2"
                                    onClick={() => setApiKeyVisible((v) => !v)}
                                >
                                    {apiKeyVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 border-zinc-700 px-2"
                                    onClick={() => copyToClipboard(placeholderApiKey)}
                                >
                                    <Copy className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 border-zinc-700 px-2 text-[10px]"
                                >
                                    <RefreshCw className="size-3.5 mr-1" />
                                    Rotate
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-zinc-400">Sample payload</Label>
                            <pre className="rounded border border-zinc-700 bg-zinc-900/80 p-3 font-mono text-[10px] text-zinc-400 overflow-x-auto">
                                {SAMPLE_PAYLOAD}
                            </pre>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => copyToClipboard(SAMPLE_PAYLOAD)}
                            >
                                <Copy className="size-3 mr-1" />
                                Copy sample
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 border-zinc-700"
                                onClick={handleTestWebhook}
                                disabled={testWebhookStatus === 'sending'}
                            >
                                {testWebhookStatus === 'sending'
                                    ? 'Sending…'
                                    : testWebhookStatus === 'success'
                                      ? '✓ Sent (mock)'
                                      : 'Test webhook'}
                            </Button>
                            {testWebhookStatus === 'success' && (
                                <span className="text-[10px] text-emerald-500">Simulated success</span>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setWebhookModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
