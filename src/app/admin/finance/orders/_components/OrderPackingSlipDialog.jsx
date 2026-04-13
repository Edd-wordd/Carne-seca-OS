'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { formatAddress, formatDateTime } from './OrdersTable';

function orderDisplayId(order) {
    if (!order) return '';
    if (order.order_number != null && order.order_number !== '') return String(order.order_number);
    const id = order.id;
    if (id == null) return '';
    return String(id).slice(0, 8);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function printPackingSlip(order) {
    if (!order) return;
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!popup) return;

    const lines = order.order_items?.length
        ? order.order_items
        : [{ product_name: `${order.items ?? 0} item(s)`, quantity: order.items ?? 0 }];
    const lineRows = lines
        .map(
            (li) => `
                    <tr>
                        <td>${escapeHtml(li.product_name ?? 'Item')}</td>
                        <td style="text-align:right;">${escapeHtml(li.quantity ?? 0)}</td>
                    </tr>`,
        )
        .join('');
    const addrHtml = escapeHtml(formatAddress(order.shipping_address)).replaceAll('\n', '<br />');
    const logo = 'Carne Seca';
    const html = `
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Packing Slip ${escapeHtml(orderDisplayId(order))}</title>
                    <style>
                        body { font-family: Inter, Arial, sans-serif; padding: 24px; color: #111; }
                        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:16px; }
                        .logo { font-size: 24px; font-weight: 700; letter-spacing: .4px; }
                        .meta { font-size: 12px; line-height:1.5; text-align:right; }
                        .section { margin-top: 14px; }
                        .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #555; margin-bottom: 6px; }
                        .value { font-size: 14px; line-height: 1.45; }
                        table { width:100%; border-collapse:collapse; margin-top:8px; }
                        th, td { border-bottom:1px solid #ddd; padding:8px 6px; font-size:13px; }
                        th { text-align:left; color:#444; font-size:11px; text-transform:uppercase; letter-spacing:.06em; }
                        .foot { margin-top: 18px; font-size:11px; color:#666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">${escapeHtml(logo)}</div>
                        <div class="meta">
                            <div><strong>Order:</strong> ${escapeHtml(orderDisplayId(order))}</div>
                            <div><strong>Date:</strong> ${escapeHtml(formatDateTime(order.created_at))}</div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="label">Customer</div>
                        <div class="value">${escapeHtml(order.customer_name || '—')}</div>
                    </div>
                    <div class="section">
                        <div class="label">Shipping Address</div>
                        <div class="value">${addrHtml}</div>
                    </div>
                    <div class="section">
                        <div class="label">Items to Pack</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align:right;">Qty</th>
                                </tr>
                            </thead>
                            <tbody>${lineRows}</tbody>
                        </table>
                    </div>
                    <div class="foot">Packing slip generated from Admin Orders</div>
                </body>
            </html>
        `;

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
}

export function OrderPackingSlipDialog({ order, onClose }) {
    return (
        <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto border-zinc-800 bg-zinc-900 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Print Packing Slip</DialogTitle>
                    <DialogDescription>
                        {order
                            ? `Generate packing slip for ${orderDisplayId(order)} — ${order.customer_name || '—'}`
                            : ''}
                    </DialogDescription>
                </DialogHeader>
                {order ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                            <p className="text-zinc-100 text-lg font-semibold">Carne Seca</p>
                            <div className="text-right text-xs text-zinc-400">
                                <p>
                                    Order: <span className="font-mono text-zinc-300">{orderDisplayId(order)}</span>
                                </p>
                                <p>{formatDateTime(order.created_at)}</p>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Customer</p>
                            <p className="text-zinc-100">{order.customer_name || '—'}</p>
                        </div>
                        <div className="mt-3 space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Shipping address</p>
                            <p className="text-zinc-300 text-xs whitespace-pre-line">
                                {formatAddress(order.shipping_address)}
                            </p>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Items to pack</p>
                            <div className="rounded border border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Item</TableHead>
                                            <TableHead className="h-8 px-3 text-[10px] text-zinc-500 text-right w-16">
                                                Qty
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(order.order_items?.length
                                            ? order.order_items
                                            : [
                                                  {
                                                      product_name: `${order.items ?? 0} item(s)`,
                                                      quantity: order.items ?? 0,
                                                  },
                                              ]
                                        ).map((li, idx) => (
                                            <TableRow key={`${order.id}-pack-li-${idx}`} className="border-zinc-800">
                                                <TableCell className="px-3 py-2 text-xs text-zinc-200">
                                                    {li.product_name}
                                                </TableCell>
                                                <TableCell className="px-3 py-2 text-xs text-zinc-300 text-right tabular-nums">
                                                    {li.quantity ?? 0}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                ) : null}
                <DialogFooter className="gap-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => printPackingSlip(order)}
                        className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                    >
                        <Printer className="mr-2 size-3.5" />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
