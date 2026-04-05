'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon } from 'lucide-react';

export default function CatalogProductDialog({
    open,
    setOpen,
    editingId,
    clearPendingCloseReset,
    scheduleResetAfterClose,
    form,
    setForm,
    productCategories,
    handleSubmitProduct,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (nextOpen) {
                    clearPendingCloseReset();
                } else {
                    scheduleResetAfterClose();
                }
            }}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Product' : 'Add Product to Live Website'}</DialogTitle>
                    <DialogDescription>
                        {editingId
                            ? 'Update product details. Active products appear on your store.'
                            : 'Add a new product with images, description, and pricing. Active products appear on your store.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitProduct} className="space-y-5 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-300">Product Image</Label>
                        <div className="flex gap-3">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-600 bg-zinc-950/50">
                                {form.imageUrl ? (
                                    <img
                                        src={form.imageUrl}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => (e.target.style.display = 'none')}
                                    />
                                ) : (
                                    <ImageIcon className="size-8 text-zinc-600" />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-2">
                                <Input
                                    placeholder="Image URL (e.g. https://...)"
                                    value={form.imageUrl ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                    className="h-9 border-zinc-700 bg-zinc-950/80 text-xs text-white placeholder:text-zinc-500"
                                />
                                <p className="text-[10px] text-zinc-400">Or drag & drop (coming soon)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prod-name" className="text-xs text-zinc-300">
                            Product Name
                        </Label>
                        <Input
                            id="prod-name"
                            placeholder="e.g. Premium Brisket 12oz"
                            value={form.name ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prod-flavor" className="text-xs text-zinc-400">
                            Flavor
                        </Label>
                        <Input
                            id="prod-flavor"
                            placeholder="e.g. Brisket, Classic"
                            value={form.flavor ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, flavor: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prod-desc" className="text-xs text-zinc-300">
                            Description
                        </Label>
                        <textarea
                            id="prod-desc"
                            placeholder="Describe the product for customers..."
                            value={form.description ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={3}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-cost" className="text-xs text-zinc-300">
                                Cost/Bag ($)
                            </Label>
                            <Input
                                id="prod-cost"
                                type="number"
                                min={0}
                                step={0.01}
                                placeholder="5.50"
                                value={form.costPerBag ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, costPerBag: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-price" className="text-xs text-zinc-300">
                                Sell Price ($)
                            </Label>
                            <Input
                                id="prod-price"
                                type="number"
                                min={0}
                                step={0.01}
                                placeholder="14.99"
                                value={form.price ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-size" className="text-xs text-zinc-300">
                                Size/oz
                            </Label>
                            <Input
                                id="prod-size"
                                placeholder="e.g. 6oz"
                                value={form.size ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                                className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prod-launch" className="text-xs text-zinc-300">
                            Launch Date
                        </Label>
                        <Input
                            id="prod-launch"
                            type="date"
                            value={form.launchDate ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, launchDate: e.target.value }))}
                            className="h-9 border-zinc-700 bg-zinc-950/80 text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Category</Label>
                            <Select
                                value={form.category ?? 'carne_seca'}
                                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                            >
                                <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {productCategories.map((c) => (
                                        <SelectItem key={c.value} value={c.value} className="text-xs">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Status</Label>
                            <Select value={form.status ?? 'active'} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                                <SelectTrigger className="h-9 border-zinc-700 bg-zinc-950/80 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active" className="text-xs">
                                        Active (visible on site)
                                    </SelectItem>
                                    <SelectItem value="inactive" className="text-xs">
                                        Hidden (draft)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                            {editingId ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
