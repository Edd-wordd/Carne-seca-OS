import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/helpers';

export function CouponKpiCard({ label, value, icon: Icon, iconClassName, valueClassName, hint }) {
    return (
        <Card className="border-zinc-800 bg-zinc-900/70">
            <CardContent className="flex items-start justify-between p-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                    <p className={cn('mt-1 text-base font-semibold tabular-nums text-zinc-100', valueClassName)}>
                        {value}
                    </p>
                    {hint ? <p className="mt-0.5 text-[10px] text-zinc-600">{hint}</p> : null}
                </div>
                {Icon ? <Icon className={cn('mt-0.5 size-4', iconClassName)} /> : null}
            </CardContent>
        </Card>
    );
}
