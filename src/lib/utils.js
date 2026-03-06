import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(priceInCents / 100);
}

export function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n ?? 0);
}

export function escapeCsv(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function isProcessingStatus(status) {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'pending' || s === 'processing' || s === 'partial_damaged' || s === 'partial';
}

export function getStatusConfig(status) {
    if (status == null || status === '') {
        return { label: '—', className: 'text-zinc-500' };
    }
    const s = String(status).toLowerCase();
    if (isProcessingStatus(status)) {
        return { label: 'Processing', className: 'text-amber-400' };
    }
    if (s === 'damaged' || s === 'full_damaged') {
        return { label: 'Damaged', className: 'text-red-400' };
    }
    if (s === 'finished' || s === 'completed') {
        return { label: 'Finished', className: 'text-emerald-400' };
    }
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return { label, className: 'text-zinc-400' };
}

export function getYieldBadgeConfig(yieldDecimal) {
    if (yieldDecimal === null || yieldDecimal === undefined) {
        return {
            label: '—',
            className: 'border-zinc-600/30 bg-zinc-600/10 text-zinc-500',
        };
    }
    const yieldPercent = Math.round(yieldDecimal * 100);
    if (yieldPercent >= 40) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        };
    }
    if (yieldPercent >= 30) {
        return {
            label: `${yieldPercent}%`,
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        };
    }
    return {
        label: `${yieldPercent}%`,
        className: 'border-red-500/30 bg-red-500/10 text-red-400',
    };
}
