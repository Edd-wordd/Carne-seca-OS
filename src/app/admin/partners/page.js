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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    DollarSign,
    Download,
    FileDown,
    MoreHorizontal,
    Pencil,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Search,
    User,
    Phone,
    Mail,
    MapPin,
    MapPinned,
    Package,
    CalendarClock,
    BarChart2,
    RefreshCw,
    Calendar,
    XCircle,
    PlusCircle,
    MinusCircle,
    ClipboardCheck,
    AlertTriangle,
    CheckCircle2,
    CircleX,
} from 'lucide-react';

const PARTNER_PAGE_SIZE = 5;

const CONSIGNMENT_CHECK_OPTIONS = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'as_needed', label: 'As needed' },
];

const SUBTRACT_REASONS = [
    { value: 'sold', label: 'Sold' },
    { value: 'stolen', label: 'Stolen' },
    { value: 'spoilage', label: 'Spoilage' },
];

const CONSIGNMENT_FLAVORS = [
    'Original 6oz',
    'Seasoned Classic 8oz',
    'Premium Brisket 12oz',
    'Garlic & Herb 6oz',
    'Limited Smoked',
];

function getConsignmentTotal(byFlavor) {
    if (!byFlavor || typeof byFlavor !== 'object') return 0;
    return Object.values(byFlavor).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

function getNextCheckupDateFromFrequency(freq) {
    const d = new Date();
    switch (freq) {
        case 'weekly':
            d.setDate(d.getDate() + 7);
            break;
        case 'biweekly':
            d.setDate(d.getDate() + 14);
            break;
        case 'monthly':
            d.setMonth(d.getMonth() + 1);
            break;
        case 'quarterly':
            d.setMonth(d.getMonth() + 3);
            break;
        case 'as_needed':
        default:
            d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().slice(0, 10);
}

function DetailRow({ label, value, icon: Icon, compact }) {
    if (value == null || value === '') return null;
    return (
        <div className={cn('flex items-start gap-2', compact && 'gap-1.5')}>
            {Icon && (
                <div
                    className={cn(
                        'mt-0.5 flex shrink-0 items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/50',
                        compact ? 'size-5' : 'size-7 rounded-md',
                    )}
                >
                    <Icon className={cn('text-zinc-400', compact ? 'size-2.5' : 'size-3.5')} />
                </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
                <p
                    className={cn(
                        'text-zinc-500 font-medium uppercase tracking-wider',
                        compact ? 'text-[8px]' : 'text-[10px]',
                    )}
                >
                    {label}
                </p>
                <p className={cn('text-zinc-200 leading-relaxed', compact ? 'truncate text-[10px]' : 'text-[13px]')}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
}
import { cn } from '@/lib/utils';

// Payout schedule (from promoter_payouts)
const MOCK_PAYOUTS = [
    { id: 1, partnerName: 'Artisan Meats Co.', earned: 428, frequency: 'Monthly', nextPayout: '2025-03-01' },
    { id: 2, partnerName: 'Downtown Provisions', earned: 614, frequency: 'Bi-weekly', nextPayout: '2025-02-24' },
    { id: 3, partnerName: 'Farm & Table', earned: 71, frequency: 'Monthly', nextPayout: '2025-03-15' },
];

// Dense partner list
const INITIAL_PARTNERS = [
    {
        id: '1',
        name: 'Artisan Meats Co.',
        owner: 'J. Rivera',
        mainContact: 'J. Rivera',
        contractHolder: 'J. Rivera',
        phone: '(512) 555-0123',
        email: 'j.rivera@artisanmeats.com',
        location: 'Austin, TX',
        address: '123 Main St, Austin, TX 78701',
        startDate: '2024-08-15',
        totalSales: 4280,
        soldPrice: 12.99,
        consignmentOriginal: 5,
        consignmentSplit: 70,
        consignmentByFlavor: {
            'Original 6oz': 0,
            'Seasoned Classic 8oz': 0,
            'Premium Brisket 12oz': 0,
            'Garlic & Herb 6oz': 0,
            'Limited Smoked': 0,
        },
        consignmentCheck: 'monthly',
        nextCheckup: '2025-03-15',
        status: 'active',
        notes: '',
        paymentsReceived: [],
        stockAdjustments: [],
    },
    {
        id: '2',
        name: 'Downtown Provisions',
        owner: 'M. Chen',
        mainContact: 'M. Chen',
        contractHolder: 'M. Chen',
        phone: '(713) 555-0456',
        email: 'm.chen@downtownprovisions.com',
        location: 'Houston, TX',
        address: '456 Commerce Ave, Houston, TX 77002',
        startDate: '2024-06-01',
        totalSales: 5120,
        soldPrice: 11.5,
        consignmentOriginal: 50,
        consignmentSplit: 65,
        consignmentByFlavor: {
            'Original 6oz': 12,
            'Seasoned Classic 8oz': 10,
            'Premium Brisket 12oz': 8,
            'Garlic & Herb 6oz': 6,
            'Limited Smoked': 6,
        },
        consignmentCheck: 'weekly',
        nextCheckup: '2025-02-24',
        lastCheckupDate: '2025-02-18',
        lastCheckupBy: 'M. Chen',
        status: 'active',
        notes: '',
        paymentsReceived: [],
        stockAdjustments: [],
    },
    {
        id: '3',
        name: 'Farm & Table',
        owner: 'S. Taylor',
        mainContact: 'S. Taylor',
        contractHolder: 'Farm & Table LLC',
        phone: '(210) 555-0789',
        email: 'staylor@farmandtable.com',
        location: 'San Antonio, TX',
        address: '789 Ranch Rd, San Antonio, TX 78205',
        startDate: '2025-01-10',
        totalSales: 890,
        soldPrice: 13.0,
        consignmentOriginal: 12,
        consignmentSplit: 60,
        consignmentByFlavor: {
            'Original 6oz': 0,
            'Seasoned Classic 8oz': 0,
            'Premium Brisket 12oz': 0,
            'Garlic & Herb 6oz': 0,
            'Limited Smoked': 0,
        },
        consignmentCheck: 'biweekly',
        nextCheckup: '2025-03-01',
        status: 'active',
        notes: '',
        paymentsReceived: [],
        stockAdjustments: [],
    },
    {
        id: '4',
        name: 'Highland Butchery',
        owner: 'R. Adams',
        mainContact: 'R. Adams',
        contractHolder: 'R. Adams',
        phone: '(214) 555-0321',
        email: 'radams@highlandbutchery.com',
        location: 'Dallas, TX',
        address: '321 Oak Blvd, Dallas, TX 75201',
        startDate: '2024-09-22',
        totalSales: 3890,
        soldPrice: 12.5,
        consignmentOriginal: 35,
        consignmentSplit: 70,
        consignmentByFlavor: {
            'Original 6oz': 6,
            'Seasoned Classic 8oz': 8,
            'Premium Brisket 12oz': 4,
            'Garlic & Herb 6oz': 5,
            'Limited Smoked': 5,
        },
        consignmentCheck: 'weekly',
        nextCheckup: '2025-02-21',
        status: 'active',
        notes: '',
        paymentsReceived: [],
        stockAdjustments: [],
    },
];

const MOCK_PARTNER_STATS = {
    totalRevenue: '$4,280',
    ordersCount: 42,
    revenueByMonth: [
        { month: 'Oct', value: 1200 },
        { month: 'Nov', value: 1800 },
        { month: 'Dec', value: 2200 },
        { month: 'Jan', value: 1900 },
        { month: 'Feb', value: 2480 },
    ],
};

export default function PartnersPage() {
    const [partners, setPartners] = React.useState(INITIAL_PARTNERS);
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [selectedPartner, setSelectedPartner] = React.useState(null);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editingPartner, setEditingPartner] = React.useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [partnerToDelete, setPartnerToDelete] = React.useState(null);
    const [endPartnershipModalOpen, setEndPartnershipModalOpen] = React.useState(false);
    const [partnerToEnd, setPartnerToEnd] = React.useState(null);
    const [endPartnershipReason, setEndPartnershipReason] = React.useState('');
    const [stockAdjustFlavor, setStockAdjustFlavor] = React.useState(CONSIGNMENT_FLAVORS[0]);
    const [stockAdjustQty, setStockAdjustQty] = React.useState('');
    const [subtractReasonModalOpen, setSubtractReasonModalOpen] = React.useState(false);
    const [subtractReasonPending, setSubtractReasonPending] = React.useState(null);
    const [checkupModalOpen, setCheckupModalOpen] = React.useState(false);
    const [checkupPartner, setCheckupPartner] = React.useState(null);
    const [checkupVisitNotes, setCheckupVisitNotes] = React.useState('');
    const [checkupPerformedBy, setCheckupPerformedBy] = React.useState('');
    const [checkupPendingStockAdjustments, setCheckupPendingStockAdjustments] = React.useState([]);
    const [newPaymentAmount, setNewPaymentAmount] = React.useState('');
    const [newPaymentDate, setNewPaymentDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [partnerPage, setPartnerPage] = React.useState(1);
    const [partnerSearch, setPartnerSearch] = React.useState('');
    const [editForm, setEditForm] = React.useState({
        name: '',
        owner: '',
        mainContact: '',
        contractHolder: '',
        phone: '',
        email: '',
        location: '',
        address: '',
        startDate: '',
        totalSales: '',
        soldPrice: '',
        consignmentOriginal: '',
        consignmentSplit: '',
        consignmentByFlavor: CONSIGNMENT_FLAVORS.reduce((acc, f) => ({ ...acc, [f]: 0 }), {}),
        consignmentCheck: 'monthly',
        nextCheckup: '',
        endedReason: '',
        notes: '',
    });
    const [form, setForm] = React.useState({
        name: '',
        ownerName: '',
        mainContact: '',
        contractHolder: '',
        phone: '',
        email: '',
        location: '',
        address: '',
        contractStart: '',
        monthlyCheckup: '',
        commission: '',
        consignmentSplit: '',
        soldPrice: '',
        consignmentCheck: 'monthly',
        nextCheckup: '',
        type: 'Promoter',
    });

    const handleAddPartner = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        const nextId = String(Math.max(...partners.map((p) => parseInt(p.id, 10)), 0) + 1);
        setPartners((prev) => [
            ...prev,
            {
                id: nextId,
                name: form.name.trim(),
                owner: form.ownerName.trim() || form.name.trim(),
                mainContact: form.mainContact.trim() || form.ownerName.trim(),
                contractHolder: form.contractHolder?.trim() || form.ownerName.trim() || form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                location: form.location.trim(),
                address: form.address?.trim() ?? '',
                startDate: form.contractStart?.trim() ?? '',
                totalSales: 0,
                soldPrice: parseFloat(form.soldPrice) || 0,
                consignmentOriginal: 0,
                consignmentSplit: parseInt(form.consignmentSplit, 10) || 0,
                consignmentByFlavor: CONSIGNMENT_FLAVORS.reduce((acc, f) => ({ ...acc, [f]: 0 }), {}),
                consignmentCheck: form.consignmentCheck || 'monthly',
                nextCheckup: form.nextCheckup?.trim() ?? '',
                status: 'active',
                notes: '',
                paymentsReceived: [],
                stockAdjustments: [],
            },
        ]);
        setForm({
            name: '',
            ownerName: '',
            mainContact: '',
            contractHolder: '',
            phone: '',
            email: '',
            location: '',
            address: '',
            contractStart: '',
            monthlyCheckup: '',
            commission: '',
            consignmentSplit: '',
            soldPrice: '',
            consignmentCheck: 'monthly',
            nextCheckup: '',
            type: 'Promoter',
        });
        setAddModalOpen(false);
    };

    const filteredPartners = React.useMemo(() => {
        if (!partnerSearch.trim()) return partners;
        const q = partnerSearch.trim().toLowerCase();
        return partners.filter(
            (p) =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.owner && p.owner.toLowerCase().includes(q)) ||
                ((p.mainContact ?? p.owner) &&
                    String(p.mainContact ?? p.owner)
                        .toLowerCase()
                        .includes(q)) ||
                (p.phone && p.phone.toLowerCase().includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q)) ||
                (p.location && p.location.toLowerCase().includes(q)),
        );
    }, [partners, partnerSearch]);

    React.useEffect(() => setPartnerPage(1), [partnerSearch]);

    const partnerTotalPages = Math.max(1, Math.ceil(filteredPartners.length / PARTNER_PAGE_SIZE));
    const safePartnerPage = Math.min(partnerPage, partnerTotalPages);
    const paginatedPartners = filteredPartners.slice(
        (safePartnerPage - 1) * PARTNER_PAGE_SIZE,
        safePartnerPage * PARTNER_PAGE_SIZE,
    );

    const openEditModal = (p) => {
        setEditingPartner(p);
        setEditForm({
            name: p.name ?? '',
            owner: p.owner ?? '',
            mainContact: p.mainContact ?? p.owner ?? '',
            contractHolder: p.contractHolder ?? p.owner ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
            location: p.location ?? '',
            address: p.address ?? '',
            startDate: p.startDate ?? '',
            totalSales: String(p.totalSales ?? ''),
            soldPrice: String(p.soldPrice ?? ''),
            consignmentOriginal: String(p.consignmentOriginal ?? 0),
            consignmentSplit: String(p.consignmentSplit ?? ''),
            consignmentByFlavor: CONSIGNMENT_FLAVORS.reduce(
                (acc, f) => ({ ...acc, [f]: String((p.consignmentByFlavor && p.consignmentByFlavor[f]) ?? 0) }),
                {},
            ),
            consignmentCheck: p.consignmentCheck ?? 'monthly',
            nextCheckup: p.nextCheckup ?? '',
            endedReason: p.endedReason ?? '',
            notes: p.notes ?? '',
        });
        setEditModalOpen(true);
    };

    const formatCheckupDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return isNaN(dt.getTime())
            ? d
            : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const exportPartnerCsv = (p) => {
        if (!p) return;
        const onHand = getConsignmentTotal(p.consignmentByFlavor);
        const totalReceived = (p.paymentsReceived || []).reduce((sum, pmt) => sum + (pmt.amount || 0), 0);
        const totalLoss = (p.stockAdjustments || []).reduce(
            (sum, adj) =>
                adj.type === 'subtract' && (adj.reason === 'spoilage' || adj.reason === 'stolen')
                    ? sum + (adj.qty || 0) * (parseFloat(p.soldPrice) || 0)
                    : sum,
            0,
        );
        const sold = Math.max(0, (p.consignmentOriginal ?? 0) - onHand);
        const headers = [
            'Name',
            'Owner',
            'Main Contact',
            'Contract Holder',
            'Phone',
            'Email',
            'Location',
            'Address',
            'Start Date',
            'Status',
            'Total Sales',
            'Sold Price',
            'Consignment Original',
            'On Hand',
            'Sold',
            'Consignment Split %',
            'Consignment Check',
            'Next Check-up',
            'Total Paid',
            'Total Loss',
            'Notes',
            ...CONSIGNMENT_FLAVORS.map((f) => `Qty: ${f}`),
        ];
        const row = [
            p.name ?? '',
            p.owner ?? '',
            p.mainContact ?? '',
            p.contractHolder ?? '',
            p.phone ?? '',
            p.email ?? '',
            p.location ?? '',
            p.address ?? '',
            p.startDate ?? '',
            p.status ?? '',
            p.totalSales ?? '',
            p.soldPrice ?? '',
            p.consignmentOriginal ?? '',
            onHand,
            sold,
            p.consignmentSplit ?? '',
            p.consignmentCheck ?? '',
            p.nextCheckup ?? '',
            totalReceived.toFixed(2),
            totalLoss.toFixed(2),
            p.notes ?? '',
            ...CONSIGNMENT_FLAVORS.map((f) => (p.consignmentByFlavor?.[f] ?? 0)),
        ];
        const csv = [headers.map(escapeCsv).join(','), row.map(escapeCsv).join(',')].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(p.name || 'partner').replace(/[^a-z0-9]/gi, '_')}_export.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const openDeleteModal = (p) => {
        setPartnerToDelete(p);
        setDeleteModalOpen(true);
    };

    const handleEndPartnership = () => {
        if (!partnerToEnd || !endPartnershipReason.trim()) return;
        const endedDate = new Date().toISOString().slice(0, 10);
        setPartners((prev) =>
            prev.map((x) =>
                x.id === partnerToEnd.id
                    ? { ...x, status: 'ended', endedDate, endedReason: endPartnershipReason.trim() }
                    : x,
            ),
        );
        setSelectedPartner((prev) => (prev?.id === partnerToEnd.id ? null : prev));
        setEndPartnershipModalOpen(false);
        setPartnerToEnd(null);
        setEndPartnershipReason('');
    };

    const handleAdjustStock = (partnerId, flavor, delta, subtractReason, qtyOverride) => {
        const qty = qtyOverride ?? Math.abs(parseInt(stockAdjustQty, 10) || 0);
        if (qty <= 0) return;
        if (delta < 0 && !subtractReason) return;
        const adjustmentDate = new Date().toISOString().slice(0, 10);
        const type = delta > 0 ? 'add' : 'subtract';
        const adjustment = {
            id: String(Date.now()),
            date: adjustmentDate,
            flavor,
            type,
            qty,
            ...(type === 'subtract' && { reason: subtractReason }),
        };
        setPartners((prev) =>
            prev.map((x) => {
                if (x.id !== partnerId) return x;
                const byFlavor = {
                    ...(x.consignmentByFlavor || {}),
                    [flavor]: Math.max(0, (x.consignmentByFlavor?.[flavor] ?? 0) + delta * qty),
                };
                const newOriginal = delta > 0 ? (x.consignmentOriginal ?? 0) + qty : (x.consignmentOriginal ?? 0);
                return {
                    ...x,
                    consignmentByFlavor: byFlavor,
                    consignmentOriginal: delta > 0 ? newOriginal : (x.consignmentOriginal ?? 0),
                    stockAdjustments: [...(x.stockAdjustments || []), adjustment],
                };
            }),
        );
        setStockAdjustQty('');
        setSubtractReasonModalOpen(false);
        setSubtractReasonPending(null);
    };

    const handleSubClick = (partnerId) => {
        const qty = Math.abs(parseInt(stockAdjustQty, 10) || 0);
        if (qty <= 0) return;
        setSubtractReasonPending({ partnerId, flavor: stockAdjustFlavor, qty, forCheckup: true });
        setSubtractReasonModalOpen(true);
    };

    const handleSubtractWithReason = (reason) => {
        if (!subtractReasonPending) return;
        if (subtractReasonPending.forCheckup) {
            setCheckupPendingStockAdjustments((prev) => [
                ...prev,
                {
                    flavor: subtractReasonPending.flavor,
                    qty: subtractReasonPending.qty,
                    type: 'subtract',
                    reason,
                },
            ]);
            setStockAdjustQty('');
        } else {
            handleAdjustStock(
                subtractReasonPending.partnerId,
                subtractReasonPending.flavor,
                -1,
                reason,
                subtractReasonPending.qty,
            );
        }
        setSubtractReasonModalOpen(false);
        setSubtractReasonPending(null);
    };

    const handleAddPayment = (partnerId) => {
        const amount = parseFloat(newPaymentAmount);
        if (!partnerId || isNaN(amount) || amount <= 0) return;
        const payment = { id: String(Date.now()), date: newPaymentDate, amount };
        setPartners((prev) =>
            prev.map((x) =>
                x.id === partnerId ? { ...x, paymentsReceived: [...(x.paymentsReceived || []), payment] } : x,
            ),
        );
        setNewPaymentAmount('');
        setNewPaymentDate(new Date().toISOString().slice(0, 10));
    };

    const openCheckupModal = (p) => {
        setCheckupPartner(p);
        setCheckupVisitNotes('');
        setCheckupPerformedBy('');
        setCheckupPendingStockAdjustments([]);
        setCheckupModalOpen(true);
    };

    const handleCompleteCheckup = () => {
        if (!checkupPartner) return;
        const today = new Date().toISOString().slice(0, 10);
        const nextDate = getNextCheckupDateFromFrequency(checkupPartner.consignmentCheck ?? 'monthly');
        const paymentAmount = parseFloat(newPaymentAmount);
        const hasPayment = !isNaN(paymentAmount) && paymentAmount > 0;
        const payment = hasPayment
            ? { id: String(Date.now()), date: newPaymentDate, amount: paymentAmount }
            : null;

        setPartners((prev) =>
            prev.map((x) => {
                if (x.id !== checkupPartner.id) return x;
                const updates = {
                    lastCheckupDate: today,
                    lastCheckupBy: checkupPerformedBy.trim() || undefined,
                    nextCheckup: nextDate,
                };
                if (payment) {
                    updates.paymentsReceived = [...(x.paymentsReceived || []), payment];
                }
                if (checkupVisitNotes.trim()) {
                    const dateStr = new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    const newNote = `[${dateStr}] Visit: ${checkupVisitNotes.trim()}`;
                    updates.notes = [x.notes, newNote].filter(Boolean).join('\n\n');
                }
                if (checkupPendingStockAdjustments.length > 0) {
                    let byFlavor = { ...(x.consignmentByFlavor || {}) };
                    let consignmentOriginal = x.consignmentOriginal ?? 0;
                    const newStockAdjustments = [...(x.stockAdjustments || [])];
                    const adjustmentDate = today;
                    for (const adj of checkupPendingStockAdjustments) {
                        const delta = adj.type === 'add' ? 1 : -1;
                        const qty = adj.qty;
                        byFlavor = {
                            ...byFlavor,
                            [adj.flavor]: Math.max(
                                0,
                                (byFlavor[adj.flavor] ?? 0) + delta * qty,
                            ),
                        };
                        if (adj.type === 'add') consignmentOriginal += qty;
                        newStockAdjustments.push({
                            id: String(Date.now() + Math.random()),
                            date: adjustmentDate,
                            flavor: adj.flavor,
                            type: adj.type,
                            qty,
                            ...(adj.type === 'subtract' && adj.reason && { reason: adj.reason }),
                        });
                    }
                    updates.consignmentByFlavor = byFlavor;
                    updates.consignmentOriginal = consignmentOriginal;
                    updates.stockAdjustments = newStockAdjustments;
                }
                return { ...x, ...updates };
            }),
        );
        setNewPaymentAmount('');
        setNewPaymentDate(new Date().toISOString().slice(0, 10));
        setCheckupModalOpen(false);
        setCheckupPartner(null);
        setCheckupVisitNotes('');
        setCheckupPerformedBy('');
        setCheckupPendingStockAdjustments([]);
    };

    const handleDeletePartner = () => {
        if (!partnerToDelete) return;
        const idToDelete = partnerToDelete.id;
        setPartners((prev) => prev.filter((x) => x.id !== idToDelete));
        setSelectedPartner((prev) => (prev?.id === idToDelete ? null : prev));
        setDeleteModalOpen(false);
        setPartnerToDelete(null);
        setPartnerPage((p) => {
            const newFilteredCount = Math.max(0, filteredPartners.length - 1);
            const newTotalPages = Math.max(1, Math.ceil(newFilteredCount / PARTNER_PAGE_SIZE));
            return p > newTotalPages ? newTotalPages : p;
        });
    };

    const handleUpdatePartner = (e) => {
        e.preventDefault();
        if (!editingPartner) return;
        const totalSales = parseInt(editForm.totalSales, 10) || 0;
        const soldPrice = parseFloat(editForm.soldPrice) || 0;
        const consignmentByFlavor = CONSIGNMENT_FLAVORS.reduce(
            (acc, f) => ({ ...acc, [f]: parseInt(editForm.consignmentByFlavor?.[f], 10) || 0 }),
            {},
        );
        setPartners((prev) =>
            prev.map((p) =>
                p.id === editingPartner.id
                    ? {
                          ...p,
                          name: editForm.name.trim() || p.name,
                          owner: editForm.owner.trim() || p.owner,
                          mainContact: editForm.mainContact.trim() || editForm.owner.trim() || p.mainContact,
                          contractHolder: (editForm.contractHolder.trim() || p.contractHolder || p.owner) ?? '',
                          phone: editForm.phone.trim() || p.phone,
                          email: editForm.email.trim() || p.email,
                          location: editForm.location.trim() || p.location,
                          address: editForm.address.trim() || p.address,
                          startDate: editForm.startDate.trim() || p.startDate,
                          totalSales,
                          consignmentOriginal: parseInt(editForm.consignmentOriginal, 10) || 0,
                          consignmentSplit: parseInt(editForm.consignmentSplit, 10) || 0,
                          consignmentByFlavor,
                          consignmentCheck: editForm.consignmentCheck || 'monthly',
                          nextCheckup: editForm.nextCheckup.trim() || p.nextCheckup,
                          soldPrice,
                          endedReason: editForm.endedReason?.trim() ?? p.endedReason ?? '',
                          notes: editForm.notes?.trim() ?? p.notes ?? '',
                      }
                    : p,
            ),
        );
        setEditModalOpen(false);
        setEditingPartner(null);
    };

    const handleExportCsv = () => {
        const headers = [
            'Name',
            'Owner',
            'Main Contact',
            'Contract Holder',
            'Phone',
            'Email',
            'Location',
            'Address',
            'Start Date',
            'Total Sales',
            'Sold Price',
            'Payments Received',
            'Stock Adjustments',
            'Consignment Original',
            'Consignment Split %',
            'Consignment Stock',
            'Consignment Check',
            'Next Check-up',
            'Status',
            'Ended Date',
            'Ended Reason',
        ];
        const rows = filteredPartners.map((p) =>
            [
                p.name,
                p.owner,
                p.mainContact ?? p.owner,
                p.contractHolder ?? p.owner,
                p.phone,
                p.email ?? '',
                p.location ?? '',
                p.address ?? '',
                p.startDate ?? '',
                p.totalSales,
                p.soldPrice ?? '',
                (p.paymentsReceived || []).reduce((sum, pmt) => sum + (pmt.amount || 0), 0),
                (p.stockAdjustments || [])
                    .map(
                        (a) =>
                            `${a.date} ${a.flavor} ${a.type === 'add' ? '+' : '−'}${a.qty}${a.reason ? ` (${a.reason})` : ''}`,
                    )
                    .join('; '),
                p.consignmentOriginal ?? 0,
                p.consignmentSplit ?? '',
                getConsignmentTotal(p.consignmentByFlavor),
                CONSIGNMENT_CHECK_OPTIONS.find((o) => o.value === p.consignmentCheck)?.label ??
                    p.consignmentCheck ??
                    '',
                p.nextCheckup ?? '',
                p.status ?? 'active',
                p.endedDate ?? '',
                p.endedReason ?? '',
            ]
                .map(escapeCsv)
                .join(','),
        );
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `partners-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-zinc-100 text-lg font-semibold tracking-tight">Partners CRM</h1>
                    <p className="text-zinc-500 mt-0.5 text-xs">Payouts & directory</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 text-xs"
                        onClick={handleExportCsv}
                    >
                        <Download className="size-3.5" />
                        Export CSV
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className="size-3.5" /> Add Partner
                    </Button>
                </div>
            </div>

            {/* Payout Schedule */}
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
                    <h2 className="text-zinc-200 text-xs font-medium">Payout Schedule</h2>
                    <p className="text-zinc-500 text-[9px]">promoter_payouts</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Partner Name</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Earned Commission</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Payout Frequency</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Next Payout Date</TableHead>
                            <TableHead className="text-zinc-500 h-8 w-24 px-2 text-[10px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PAYOUTS.map((p) => (
                            <TableRow
                                key={p.id}
                                className="group border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                            >
                                <TableCell className="text-zinc-200 px-2 py-1.5 text-[11px] font-medium group-hover:text-zinc-100">
                                    {p.partnerName}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-2 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                    ${p.earned.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                    {p.frequency}
                                </TableCell>
                                <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                    {p.nextPayout}
                                </TableCell>
                                <TableCell className="px-2 py-1.5">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-[10px] text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                                    >
                                        Process Payout
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Dense Partner Table */}
            <div className="overflow-hidden rounded border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-zinc-200 text-xs font-medium">Partner Directory</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search partners…"
                                value={partnerSearch}
                                onChange={(e) => setPartnerSearch(e.target.value)}
                                className="h-7 w-[160px] border-zinc-700 bg-zinc-950 pl-8 text-[10px] text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-700/80 hover:!bg-transparent">
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Name</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Owner</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Main Contact</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Phone</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Location</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Start Date</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Total Sales</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Consignment Stock</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Check Frequency</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px]">Status</TableHead>
                            <TableHead className="text-zinc-500 h-8 px-2 text-[10px] w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPartners.length === 0 ? (
                            <TableRow className="border-zinc-700/80">
                                <TableCell colSpan={11} className="text-zinc-400 py-8 text-center text-[11px]">
                                    {partnerSearch.trim() ? 'No partners match your search' : 'No partners'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedPartners.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="group cursor-pointer border-zinc-700/80 transition-colors hover:!bg-zinc-700/50"
                                    onClick={() => setSelectedPartner(p)}
                                >
                                    <TableCell className="text-zinc-200 px-2 py-1.5 text-[11px] font-medium group-hover:text-zinc-100">
                                        {p.name}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {p.owner}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {p.mainContact ?? p.owner}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 px-2 py-1.5 text-[11px] group-hover:text-zinc-400">
                                        {p.phone}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {p.location}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {p.startDate
                                            ? new Date(p.startDate).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-zinc-100 px-2 py-1.5 tabular-nums text-[11px] font-medium group-hover:text-white">
                                        ${p.totalSales.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 tabular-nums text-[11px] group-hover:text-zinc-300">
                                        {getConsignmentTotal(p.consignmentByFlavor)}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 px-2 py-1.5 text-[11px] group-hover:text-zinc-300">
                                        {CONSIGNMENT_CHECK_OPTIONS.find((o) => o.value === p.consignmentCheck)?.label ??
                                            p.consignmentCheck ??
                                            '—'}
                                    </TableCell>
                                    <TableCell className="px-2 py-1.5 text-[11px]">
                                        <span className={p.status === 'ended' ? 'text-amber-400/90' : 'text-zinc-500'}>
                                            {p.status === 'ended' ? 'Ended' : 'Active'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600/50"
                                                >
                                                    <MoreHorizontal className="size-3.5" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
                                                <DropdownMenuItem
                                                    onClick={() => openEditModal(p)}
                                                    className="text-zinc-200 cursor-pointer"
                                                >
                                                    <Pencil className="size-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteModal(p)}
                                                    className="text-red-400 cursor-pointer"
                                                >
                                                    <Trash2 className="size-3.5 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {filteredPartners.length > 0 && (
                    <div className="flex w-full items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                            Showing {(safePartnerPage - 1) * PARTNER_PAGE_SIZE + 1}–
                            {Math.min(safePartnerPage * PARTNER_PAGE_SIZE, filteredPartners.length)} of{' '}
                            {filteredPartners.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setPartnerPage((p) => Math.max(1, p - 1))}
                                disabled={safePartnerPage <= 1}
                            >
                                <ChevronLeft className="size-3.5" />
                                Prev
                            </Button>
                            <span className="px-2 text-xs text-zinc-500">
                                Page {safePartnerPage} of {partnerTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-900/80 text-xs"
                                onClick={() => setPartnerPage((p) => Math.min(partnerTotalPages, p + 1))}
                                disabled={safePartnerPage >= partnerTotalPages}
                            >
                                Next
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Partner Dialog */}
            <Dialog
                open={editModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditModalOpen(false);
                        setEditingPartner(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-[min(95vw,960px)] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-[min(95vw,960px)]">
                    <DialogHeader>
                        <DialogTitle>Edit Partner</DialogTitle>
                        <DialogDescription>Update {editingPartner?.name ?? 'partner'} details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePartner} className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Name</Label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Business name"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Owner</Label>
                                <Input
                                    value={editForm.owner}
                                    onChange={(e) => setEditForm((f) => ({ ...f, owner: e.target.value }))}
                                    placeholder="Full name"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Main Contact</Label>
                            <Input
                                value={editForm.mainContact}
                                onChange={(e) => setEditForm((f) => ({ ...f, mainContact: e.target.value }))}
                                placeholder="Primary contact for orders & consignment"
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Contract holder</Label>
                            <Input
                                value={editForm.contractHolder}
                                onChange={(e) => setEditForm((f) => ({ ...f, contractHolder: e.target.value }))}
                                placeholder="Name or entity on the contract"
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Phone</Label>
                                <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="(555) 555-5555"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Email</Label>
                                <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="email@example.com"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-medium text-zinc-300">Location</Label>
                                <Input
                                    value={editForm.location}
                                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="City, State"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Address</Label>
                            <Input
                                value={editForm.address}
                                onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                                placeholder="Full street address"
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Start Date</Label>
                            <Input
                                type="date"
                                value={editForm.startDate}
                                onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Total Sales ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={editForm.totalSales}
                                    onChange={(e) => setEditForm((f) => ({ ...f, totalSales: e.target.value }))}
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Price sold to them ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={editForm.soldPrice}
                                    onChange={(e) => setEditForm((f) => ({ ...f, soldPrice: e.target.value }))}
                                    placeholder="Per unit"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Consignment Original (bags)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={editForm.consignmentOriginal}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, consignmentOriginal: e.target.value }))
                                    }
                                    placeholder="Original placement"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Consignment Split (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editForm.consignmentSplit}
                                    onChange={(e) => setEditForm((f) => ({ ...f, consignmentSplit: e.target.value }))}
                                    placeholder="Partner % (e.g. 70)"
                                    className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">On Hand by Flavor (bags)</Label>
                            <div className="grid gap-2 rounded-lg border border-zinc-700/60 bg-zinc-950/50 p-3">
                                {CONSIGNMENT_FLAVORS.map((flavor) => (
                                    <div key={flavor} className="flex items-center justify-between gap-3">
                                        <span className="text-zinc-400 text-xs">{flavor}</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="h-8 w-20 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-right"
                                            value={editForm.consignmentByFlavor?.[flavor] ?? ''}
                                            onChange={(e) =>
                                                setEditForm((f) => ({
                                                    ...f,
                                                    consignmentByFlavor: {
                                                        ...(f.consignmentByFlavor || {}),
                                                        [flavor]: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Consignment Check Frequency</Label>
                            <Select
                                value={editForm.consignmentCheck}
                                onValueChange={(v) => setEditForm((f) => ({ ...f, consignmentCheck: v }))}
                            >
                                <SelectTrigger className="border-zinc-700 bg-zinc-900/80 text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONSIGNMENT_CHECK_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-zinc-500 text-[10px]">How often to check on consignment orders</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Next Check-up Date</Label>
                            <Input
                                type="date"
                                value={editForm.nextCheckup}
                                onChange={(e) => setEditForm((f) => ({ ...f, nextCheckup: e.target.value }))}
                                className="border-zinc-700 bg-zinc-900/80 text-zinc-100"
                            />
                            <p className="text-zinc-500 text-[10px]">
                                When to next check on consignment for this partner
                            </p>
                        </div>
                        {editingPartner?.status === 'ended' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Ended reason</Label>
                                <textarea
                                    value={editForm.endedReason}
                                    onChange={(e) => setEditForm((f) => ({ ...f, endedReason: e.target.value }))}
                                    placeholder="Why did the partnership end?"
                                    rows={2}
                                    className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-zinc-300">Notes</Label>
                            <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                                placeholder="General notes about this partner..."
                                rows={3}
                                className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!editForm.name.trim()}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* End Partnership Confirmation */}
            <Dialog
                open={endPartnershipModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setEndPartnershipModalOpen(false);
                        setPartnerToEnd(null);
                        setEndPartnershipReason('');
                    }
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>End Partnership</DialogTitle>
                        <DialogDescription>
                            End the partnership with {partnerToEnd?.name}? The partner will be marked as ended and kept
                            in the record. You can still view their details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-zinc-300">
                            Reason <span className="text-red-400">*</span>
                        </Label>
                        <textarea
                            value={endPartnershipReason}
                            onChange={(e) => setEndPartnershipReason(e.target.value)}
                            placeholder="Required: e.g. Mutual agreement, contract expired, low sales..."
                            rows={3}
                            required
                            className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEndPartnershipModalOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEndPartnership}
                            disabled={!endPartnershipReason.trim()}
                            className="bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
                        >
                            End Partnership
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subtract Stock - Reason */}
            <Dialog
                open={subtractReasonModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSubtractReasonModalOpen(false);
                        setSubtractReasonPending(null);
                    }
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Why are you subtracting?</DialogTitle>
                        <DialogDescription>
                            {subtractReasonPending && (
                                <>
                                    Removing {subtractReasonPending.qty} × {subtractReasonPending.flavor}. Select a
                                    reason.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-2">
                        {SUBTRACT_REASONS.map((r) => (
                            <Button
                                key={r.value}
                                variant="outline"
                                className="justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                onClick={() => handleSubtractWithReason(r.value)}
                            >
                                {r.label}
                            </Button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSubtractReasonModalOpen(false);
                                setSubtractReasonPending(null);
                            }}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Checkup Modal */}
            <Dialog
                open={checkupModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setCheckupModalOpen(false);
                        setCheckupPartner(null);
                        setCheckupVisitNotes('');
                        setCheckupPerformedBy('');
                        setCheckupPendingStockAdjustments([]);
                    }
                }}
            >
                <DialogContent className="max-w-[min(95vw,720px)] overflow-visible border-zinc-800 bg-zinc-950 p-4 sm:p-4">
                    {checkupPartner && (() => {
                        const p = partners.find((x) => x.id === checkupPartner.id) ?? checkupPartner;
                        return (
                            <>
                                <DialogHeader className="pb-2">
                                    <DialogTitle className="text-base text-zinc-100">
                                        Checkup — {p.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 rounded border border-amber-600/40 bg-amber-950/30 px-2.5 py-1.5 mt-1">
                                        <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                                        <span className="text-[11px] text-amber-200/90">
                                            Report this check-in for the business
                                        </span>
                                    </div>
                                </DialogHeader>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {/* Row 1: Who + Payment */}
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-medium text-zinc-400">
                                            Who did the checkup <span className="text-red-400">*</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g. John Smith"
                                            value={checkupPerformedBy}
                                            onChange={(e) => setCheckupPerformedBy(e.target.value)}
                                            className="h-8 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-medium text-zinc-400">
                                            Payment <span className="text-red-400">*</span> (0 if none)
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Amount"
                                                value={newPaymentAmount}
                                                onChange={(e) => setNewPaymentAmount(e.target.value)}
                                                className="h-8 w-20 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-sm"
                                            />
                                            <Input
                                                type="date"
                                                value={newPaymentDate}
                                                onChange={(e) => setNewPaymentDate(e.target.value)}
                                                className="h-8 flex-1 min-w-0 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Notes + Stock */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-medium text-zinc-400">
                                            Notes from Visit <span className="text-red-400">*</span>
                                        </Label>
                                        <textarea
                                            value={checkupVisitNotes}
                                            onChange={(e) => setCheckupVisitNotes(e.target.value)}
                                            placeholder="e.g. Shelf stocked, discussed new flavors..."
                                            rows={2}
                                            className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900/80 px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-medium text-zinc-400">
                                            Stock (optional)
                                        </Label>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Select
                                                value={stockAdjustFlavor}
                                                onValueChange={setStockAdjustFlavor}
                                            >
                                                <SelectTrigger className="h-8 w-[120px] border-zinc-700 bg-zinc-900/80 text-zinc-100 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CONSIGNMENT_FLAVORS.map((f) => (
                                                        <SelectItem key={f} value={f} className="text-xs">
                                                            {f}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Qty"
                                                value={stockAdjustQty}
                                                onChange={(e) => setStockAdjustQty(e.target.value)}
                                                className="h-8 w-12 border-zinc-700 bg-zinc-900/80 text-zinc-100 text-sm text-center"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1 border-emerald-800/60 bg-zinc-800/90 text-emerald-500 hover:bg-emerald-500/10 px-2"
                                                onClick={() => {
                                                    const qty = parseInt(stockAdjustQty, 10);
                                                    if (qty > 0) {
                                                        setCheckupPendingStockAdjustments((prev) => [
                                                            ...prev,
                                                            { flavor: stockAdjustFlavor, qty, type: 'add' },
                                                        ]);
                                                        setStockAdjustQty('');
                                                    }
                                                }}
                                                disabled={
                                                    !stockAdjustQty || parseInt(stockAdjustQty, 10) <= 0
                                                }
                                            >
                                                <PlusCircle className="size-3" /> Add
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1 border-amber-800/60 bg-zinc-800/90 text-amber-500 hover:bg-amber-500/10 px-2"
                                                onClick={() => handleSubClick(p.id)}
                                                disabled={
                                                    !stockAdjustQty || parseInt(stockAdjustQty, 10) <= 0
                                                }
                                            >
                                                <MinusCircle className="size-3" /> Sub
                                            </Button>
                                        </div>
                                        {checkupPendingStockAdjustments.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                                                {checkupPendingStockAdjustments.map((adj, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-zinc-300"
                                                    >
                                                        {adj.flavor}:{' '}
                                                        {adj.type === 'add' ? (
                                                            <span className="text-emerald-500">+{adj.qty}</span>
                                                        ) : (
                                                            <span className="text-amber-500">
                                                                −{adj.qty} ({adj.reason})
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="pt-2 pb-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 bg-zinc-800/90 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50"
                                        onClick={handleCompleteCheckup}
                                        disabled={
                                            !checkupPerformedBy.trim() ||
                                            newPaymentAmount === '' ||
                                            isNaN(parseFloat(newPaymentAmount)) ||
                                            !newPaymentDate ||
                                            !checkupVisitNotes.trim()
                                        }
                                    >
                                        Done
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Delete Partner Confirmation */}
            <Dialog
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteModalOpen(false);
                        setPartnerToDelete(null);
                    }
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Partner</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove {partnerToDelete?.name} from the partner directory? This
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleDeletePartner} className="bg-red-600 text-white hover:bg-red-500">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Partner Dialog - with Contract Upload, Contract Start, Monthly Check-up */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-[min(95vw,960px)] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-[min(95vw,960px)]">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Add Partner</DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs">
                            Business, contract, documentation
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPartner} className="space-y-3">
                        <div className="space-y-1.5">
                            <p className="text-zinc-400 text-[10px] font-medium">Business</p>
                            <div className="grid gap-1.5">
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Name</Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Business name"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Owner</Label>
                                    <Input
                                        value={form.ownerName}
                                        onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                                        placeholder="Full name"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Main Contact</Label>
                                    <Input
                                        value={form.mainContact}
                                        onChange={(e) => setForm((f) => ({ ...f, mainContact: e.target.value }))}
                                        placeholder="Primary contact for consignment"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Contract holder</Label>
                                    <Input
                                        value={form.contractHolder}
                                        onChange={(e) => setForm((f) => ({ ...f, contractHolder: e.target.value }))}
                                        placeholder="Name or entity on the contract"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Phone</Label>
                                    <Input
                                        value={form.phone}
                                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                        placeholder="(555) 555-5555"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Email</Label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="email@example.com"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Location</Label>
                                    <Input
                                        value={form.location}
                                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                        placeholder="City, State"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-zinc-500 text-[10px]">Address</Label>
                                    <Input
                                        value={form.address}
                                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                        placeholder="Full street address"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-zinc-400 text-[10px] font-medium">Contract & Documentation</p>
                            <div className="grid gap-1.5">
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Contract Start</Label>
                                    <Input
                                        type="date"
                                        value={form.contractStart}
                                        onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))}
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Monthly Check-up</Label>
                                    <Input
                                        type="date"
                                        value={form.monthlyCheckup}
                                        onChange={(e) => setForm((f) => ({ ...f, monthlyCheckup: e.target.value }))}
                                        placeholder="Recurring date"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Commission %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.commission}
                                        onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
                                        placeholder="10"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Consignment Split %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.consignmentSplit}
                                        onChange={(e) => setForm((f) => ({ ...f, consignmentSplit: e.target.value }))}
                                        placeholder="Partner % (e.g. 70)"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Price sold to them ($)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.soldPrice}
                                        onChange={(e) => setForm((f) => ({ ...f, soldPrice: e.target.value }))}
                                        placeholder="Per unit"
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Consignment Check Frequency</Label>
                                    <Select
                                        value={form.consignmentCheck}
                                        onValueChange={(v) => setForm((f) => ({ ...f, consignmentCheck: v }))}
                                    >
                                        <SelectTrigger className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CONSIGNMENT_CHECK_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value} className="text-xs">
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-zinc-600 mt-0.5 text-[9px]">
                                        How often to check on consignment orders
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Next Check-up Date</Label>
                                    <Input
                                        type="date"
                                        value={form.nextCheckup}
                                        onChange={(e) => setForm((f) => ({ ...f, nextCheckup: e.target.value }))}
                                        className="mt-0.5 h-8 border-zinc-700 bg-zinc-950 text-zinc-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-500 text-[10px]">Contract Upload</Label>
                                    <div className="mt-0.5 flex min-h-[56px] items-center justify-center rounded border border-dashed border-zinc-700 bg-zinc-950/50">
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            className="h-8 border-0 bg-transparent text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-[10px] file:text-zinc-300"
                                        />
                                    </div>
                                    <p className="text-zinc-600 mt-0.5 text-[9px]">Signed PDF contract</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAddModalOpen(false)}
                                className="border-zinc-700 text-zinc-300 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs"
                            >
                                Add Partner
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Partner Detail Modal */}
            <Dialog open={!!selectedPartner} onOpenChange={(o) => !o && setSelectedPartner(null)}>
                <DialogContent className="flex h-[min(90vh,880px)] max-h-[90vh] max-w-[min(95vw,1440px)] w-full flex-col overflow-hidden border-zinc-800 bg-zinc-950 p-0 sm:max-w-[min(95vw,1440px)]">
                    {selectedPartner &&
                        (() => {
                            const p = partners.find((x) => x.id === selectedPartner.id) ?? selectedPartner;
                            const initial = (p.name || 'P').charAt(0).toUpperCase();
                            const totalReceived = (p.paymentsReceived || []).reduce(
                                (sum, pmt) => sum + (pmt.amount || 0),
                                0,
                            );
                            const onHand = getConsignmentTotal(p.consignmentByFlavor);
                            const soldPrice = parseFloat(p.soldPrice) || 0;
                            const totalValue = onHand * soldPrice;
                            const totalLoss = (p.stockAdjustments || []).reduce(
                                (sum, adj) =>
                                    adj.type === 'subtract' && (adj.reason === 'spoilage' || adj.reason === 'stolen')
                                        ? sum + (adj.qty || 0) * soldPrice
                                        : sum,
                                0,
                            );
                            const sold = Math.max(0, (p.consignmentOriginal ?? 0) - onHand);
                            return (
                                <div className="flex h-full flex-col overflow-hidden">
                                    {/* Header with hierarchy */}
                                    <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/40 px-4 py-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 ring-1 ring-zinc-700/60 text-base font-semibold text-zinc-100">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <DialogTitle className="text-base font-semibold tracking-tight text-zinc-100 truncate">
                                                        {p.name}
                                                    </DialogTitle>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge
                                                            variant={p.status === 'ended' ? 'destructive' : 'secondary'}
                                                            className="shrink-0 border-zinc-700 bg-zinc-800/90 text-zinc-200 text-[10px] font-medium"
                                                        >
                                                            {p.status === 'ended' ? 'Ended' : 'Active'}
                                                        </Badge>
                                                        <span className="text-[11px] text-zinc-500">
                                                            {p.location || '—'}
                                                        </span>
                                                        {p.status === 'ended' && p.endedDate && (
                                                            <span className="text-[10px] text-zinc-600">
                                                                · Ended {formatCheckupDate(p.endedDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-4">
                                                <div className="rounded-md bg-zinc-800/60 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                                                        Sales
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-zinc-100">
                                                        ${(p.totalSales ?? 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-zinc-800/60 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                                                        Price / Unit
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-zinc-100">
                                                        {p.soldPrice != null && p.soldPrice !== ''
                                                            ? `$${Number(p.soldPrice).toFixed(2)}`
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-zinc-800/60 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                                                        On Hand
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-zinc-100">
                                                        {onHand}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border border-emerald-800/40 bg-emerald-950/30 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-emerald-600/80">
                                                        Paid
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-emerald-400">
                                                        ${totalReceived.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border border-red-900/40 bg-red-950/20 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-red-600/80">
                                                        Total Loss
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-red-400/90">
                                                        ${totalLoss.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border border-zinc-700/60 bg-zinc-800/60 px-3 py-1.5">
                                                    <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                                                        Total Value
                                                    </p>
                                                    <p className="text-sm font-semibold tabular-nums text-zinc-100">
                                                        ${totalValue.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                {p.status !== 'ended' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 border-emerald-800/60 bg-zinc-800/90 text-emerald-500 hover:bg-emerald-900/40 hover:border-emerald-600 hover:text-emerald-400"
                                                        onClick={() => openCheckupModal(p)}
                                                    >
                                                        <ClipboardCheck className="size-3.5" />
                                                        Checkup
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 border-indigo-800/60 bg-zinc-800/90 text-indigo-500 hover:bg-indigo-900/50 hover:border-indigo-600 hover:text-indigo-400"
                                                    onClick={() => exportPartnerCsv(p)}
                                                >
                                                    <FileDown className="size-3.5" />
                                                    Export CSV
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 border-indigo-700/80 bg-indigo-950/90 text-indigo-500 hover:bg-indigo-900/80 hover:border-indigo-600 hover:text-indigo-400"
                                                    onClick={() => {
                                                        setSelectedPartner(null);
                                                        openEditModal(p);
                                                    }}
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content with clear section hierarchy */}
                                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-4 lg:grid-cols-2">
                                        <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                                            {/* Contact & Agreement */}
                                            <Card className="shrink-0 border-zinc-700/80 bg-zinc-900/50">
                                                <CardHeader className="border-b border-zinc-800 pb-2 pt-3 px-4">
                                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                                        Contact & Agreement
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 py-3">
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px]">
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Contract
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.contractHolder ?? p.owner ?? '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Owner
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.owner || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Contact
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.mainContact ?? p.owner ?? '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Phone
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.phone || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Email
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.email || '—'}
                                                            </p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Address
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.address || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Start
                                                            </p>
                                                            <p className="mt-0.5 font-medium text-zinc-200">
                                                                {p.startDate ? formatCheckupDate(p.startDate) : '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                Next Check-up
                                                            </p>
                                                            <div className="mt-0.5 flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="font-semibold text-amber-400">
                                                                        {formatCheckupDate(p.nextCheckup) || '—'}
                                                                    </p>
                                                                    {p.nextCheckup ? (
                                                                        (p.lastCheckupDate &&
                                                                            new Date(p.nextCheckup) > new Date()) ? (
                                                                            <span
                                                                                className="inline-flex items-center gap-0.5 text-emerald-500"
                                                                                title="Checkup completed"
                                                                            >
                                                                                <CheckCircle2 className="size-4" />
                                                                                <span className="text-[10px]">
                                                                                    Done
                                                                                </span>
                                                                            </span>
                                                                        ) : (
                                                                            <span
                                                                                className="inline-flex items-center gap-0.5 text-red-500/90"
                                                                                title="Checkup not done yet"
                                                                            >
                                                                                <CircleX className="size-4" />
                                                                                <span className="text-[10px]">
                                                                                    Not done
                                                                                </span>
                                                                            </span>
                                                                        )
                                                                    ) : null}
                                                                </div>
                                                                {p.lastCheckupBy && (
                                                                    <span className="text-[10px] text-zinc-500">
                                                                        Last by {p.lastCheckupBy}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {p.consignmentSplit != null && (
                                                            <div className="col-span-2">
                                                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                    Split
                                                                </p>
                                                                <p className="mt-0.5 font-medium text-zinc-200">
                                                                    {p.consignmentSplit}% partner /{' '}
                                                                    {100 - (p.consignmentSplit ?? 0)}% company
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {p.status === 'ended' && p.endedReason && (
                                                <Card className="shrink-0 border-amber-500/30 bg-amber-500/10">
                                                    <CardHeader className="py-2 px-4">
                                                        <CardTitle className="text-xs font-semibold text-amber-200">
                                                            Partnership Ended
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="px-4 pb-3 pt-0">
                                                        <p className="text-[11px] leading-relaxed text-amber-100/90">
                                                            {p.endedReason}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            <Card className="min-h-0 flex-1 border-zinc-700/80 bg-zinc-900/50 overflow-hidden">
                                                <CardHeader className="border-b border-zinc-800 pb-2 pt-3 px-4">
                                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                                        Notes
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 py-3 overflow-hidden">
                                                    <p className="text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap line-clamp-4">
                                                        {p.notes || '—'}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                                            {/* Consignment */}
                                            <Card className="flex min-h-0 flex-1 flex-col border-zinc-700/80 bg-zinc-900/50">
                                                <CardHeader className="shrink-0 border-b border-zinc-800 px-4 py-2.5">
                                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                                        Consignment
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex min-h-0 flex-1 flex-col overflow-visible px-4 py-3">
                                                    <p className="mb-3 text-[10px] text-zinc-500">
                                                        Orig: {p.consignmentOriginal ?? 0} placed · Sold:{' '}
                                                        <span className="text-emerald-400 font-medium">{sold}</span>
                                                        {p.soldPrice != null && p.soldPrice !== ''
                                                            ? ` · ${Number(p.soldPrice).toFixed(2)}/unit`
                                                            : ''}
                                                    </p>
                                                    <div className="flex min-h-0 flex-1 flex-col gap-3">
                                                        <div className="min-h-0 flex-1 overflow-auto">
                                                            <table className="w-full text-[11px]">
                                                                <thead>
                                                                    <tr className="border-b border-zinc-700/60">
                                                                        <th className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                                                            Flavor
                                                                        </th>
                                                                        <th className="pb-1.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                                                            On hand
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {CONSIGNMENT_FLAVORS.map((flavor) => (
                                                                        <tr
                                                                            key={flavor}
                                                                            className="border-b border-zinc-800/60 last:border-0"
                                                                        >
                                                                            <td className="py-1.5 font-medium text-zinc-300">
                                                                                {flavor}
                                                                            </td>
                                                                            <td className="py-1.5 text-right tabular-nums font-semibold text-zinc-100">
                                                                                {p.consignmentByFlavor?.[flavor] ?? 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {(p.stockAdjustments || []).length > 0 && (
                                                            <div className="shrink-0 rounded-md border border-zinc-700/60 bg-zinc-950/50 px-3 py-2">
                                                                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                                                    Stock history
                                                                </p>
                                                                <ul className="max-h-20 space-y-0.5 overflow-y-auto text-[10px]">
                                                                    {(p.stockAdjustments || [])
                                                                        .slice()
                                                                        .reverse()
                                                                        .slice(0, 8)
                                                                        .map((adj) => (
                                                                            <li
                                                                                key={adj.id}
                                                                                className="flex items-center justify-between gap-2"
                                                                            >
                                                                                <span className="text-zinc-500">
                                                                                    {adj.date
                                                                                        ? formatCheckupDate(adj.date)
                                                                                        : '—'}
                                                                                </span>
                                                                                <span className="font-medium text-zinc-300 truncate">
                                                                                    {adj.flavor}
                                                                                </span>
                                                                                {adj.type === 'add' ? (
                                                                                    <span className="font-semibold text-emerald-400">
                                                                                        +{adj.qty}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="font-semibold text-amber-400">
                                                                                        −{adj.qty} ({adj.reason || '—'})
                                                                                    </span>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    {(p.stockAdjustments || []).length > 8 && (
                                                                        <li className="text-zinc-500">
                                                                            +{(p.stockAdjustments || []).length - 8}{' '}
                                                                            more
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Payments */}
                                            <Card className="shrink-0 border-zinc-700/80 bg-zinc-900/50">
                                                <CardHeader className="border-b border-zinc-800 px-4 py-2.5">
                                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                                        Payments Received
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 py-3 space-y-2">
                                                    {(p.paymentsReceived || []).length > 0 ? (
                                                        <ul className="space-y-1.5">
                                                            {(p.paymentsReceived || [])
                                                                .slice()
                                                                .reverse()
                                                                .slice(0, 3)
                                                                .map((pmt) => (
                                                                    <li
                                                                        key={pmt.id}
                                                                        className="flex items-center justify-between rounded-md bg-zinc-800/40 px-3 py-1.5 text-[11px]"
                                                                    >
                                                                        <span className="text-zinc-500">
                                                                            {pmt.date
                                                                                ? formatCheckupDate(pmt.date)
                                                                                : '—'}
                                                                        </span>
                                                                        <span className="font-semibold tabular-nums text-emerald-400">
                                                                            ${Number(pmt.amount).toFixed(2)}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            {(p.paymentsReceived || []).length > 3 && (
                                                                <li className="text-[10px] text-zinc-500 px-3">
                                                                    +{(p.paymentsReceived || []).length - 3} more
                                                                </li>
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[11px] text-zinc-500 py-1">
                                                            No payments recorded yet.
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Footer with End Partnership */}
                                    {p.status !== 'ended' && (
                                        <div className="shrink-0 border-t border-zinc-800 px-4 py-3 flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 border-amber-800/60 bg-zinc-800/90 text-amber-500 hover:bg-amber-900/40 hover:border-amber-600 hover:text-amber-400"
                                                onClick={() => {
                                                    setPartnerToEnd(p);
                                                    setEndPartnershipModalOpen(true);
                                                }}
                                            >
                                                <XCircle className="size-3.5" />
                                                End Partnership
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
