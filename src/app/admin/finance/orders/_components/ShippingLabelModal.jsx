'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getShippingRates } from '@/app/actions/orders/getShippingRates';
import { purchaseShippingLabel } from '@/app/actions/orders/purchaseShippingLabel';

export function ShippingLabelModal({ order, open, onOpenChange, onSuccess }) {
    const [step, setStep] = React.useState('weight'); // 'weight' | 'rates'
    const [weightOz, setWeightOz] = React.useState('');
    const [rates, setRates] = React.useState([]);
    const [selectedRateId, setSelectedRateId] = React.useState(null);
    const [isPending, setIsPending] = React.useState(false);
    const [error, setError] = React.useState(null);

    const reset = () => {
        setStep('weight');
        setWeightOz('');
        setRates([]);
        setSelectedRateId(null);
        setIsPending(false);
        setError(null);
    };

    const handleGetRates = async () => {
        if (isPending) return;
        setError(null);
        setIsPending(true);
        try {
            const result = await getShippingRates({
                orderId: order.id,
                weightOz: Number(weightOz),
            });
            if (!result?.success) {
                setError(result?.message ?? 'Failed to get rates');
                return;
            }
            setRates(result.data.rates);
            setStep('rates');
        } finally {
            setIsPending(false);
        }
    };

    const handlePurchase = async () => {
        if (isPending || !selectedRateId) return;
        setError(null);
        setIsPending(true);
        try {
            const result = await purchaseShippingLabel({
                orderId: order.id,
                rateObjectId: selectedRateId,
            });
            const labelUrl = result?.data?.labelUrl;
            const trackingNumber = result?.data?.trackingNumber;
            if (!result?.success) {
                if (labelUrl) {
                    window.open(labelUrl, '_blank');
                }
                const fallbackMessage =
                    result?.message ??
                    'Label created, but we could not save shipment details. Please save the tracking number manually.';
                setError(
                    trackingNumber
                        ? `${fallbackMessage} Tracking number: ${trackingNumber}`
                        : fallbackMessage,
                );
                toast.error(fallbackMessage);
                return;
            }
            if (labelUrl) {
                window.open(labelUrl, '_blank');
            }
            onSuccess({
                tracking_number: trackingNumber,
                fulfillment_status: 'shipped',
            });
            toast.success('Label purchased — opening in new tab');
            onOpenChange(false);
            reset();
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) reset();
            }}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Generate Shipping Label</DialogTitle>
                </DialogHeader>

                {step === 'weight' && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400">Package weight (oz)</label>
                            <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="e.g. 16"
                                value={weightOz}
                                onChange={(e) => setWeightOz(e.target.value)}
                                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <Button className="w-full" onClick={handleGetRates} disabled={isPending || !weightOz}>
                            {isPending ? 'Getting rates...' : 'Get Rates'}
                        </Button>
                    </div>
                )}

                {step === 'rates' && (
                    <div className="space-y-4">
                        <p className="text-xs text-zinc-400">Select a carrier and service</p>
                        <div className="space-y-2">
                            {rates.map((rate) => (
                                <button
                                    key={rate.objectId}
                                    type="button"
                                    onClick={() => setSelectedRateId(rate.objectId)}
                                    className={`w-full rounded border p-3 text-left text-xs transition-colors ${
                                        selectedRateId === rate.objectId
                                            ? 'border-indigo-500 bg-indigo-500/10 text-zinc-100'
                                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            {rate.carrier} — {rate.service}
                                        </span>
                                        <span className="font-medium">
                                            ${rate.price} {rate.currency}
                                        </span>
                                    </div>
                                    {rate.days && (
                                        <p className="mt-0.5 text-zinc-500">
                                            Est. {rate.days} day{rate.days !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 border-zinc-700"
                                onClick={() => {
                                    setStep('weight');
                                    setError(null);
                                }}
                                disabled={isPending}
                            >
                                Back
                            </Button>
                            <Button className="flex-1" onClick={handlePurchase} disabled={isPending || !selectedRateId}>
                                {isPending ? 'Purchasing...' : 'Purchase Label'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
