'use client';

import * as React from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const presets = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: '7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: '30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    { label: 'Last Month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    { label: 'All Time', getValue: () => ({ from: undefined, to: undefined }) },
];

export function DateRangePicker({ date, onDateChange, className }) {
    const [open, setOpen] = React.useState(false);
    const [selectedPreset, setSelectedPreset] = React.useState('All Time');
    const [showCalendar, setShowCalendar] = React.useState(false);

    const handlePresetClick = (preset) => {
        const range = preset.getValue();
        setSelectedPreset(preset.label);
        onDateChange?.(range);
        setOpen(false);
    };

    const handleCalendarSelect = (range) => {
        setSelectedPreset('Custom');
        onDateChange?.(range);
    };

    const getDisplayLabel = () => {
        if (!date?.from && !date?.to) {
            return selectedPreset || 'All Time';
        }
        if (selectedPreset && selectedPreset !== 'Custom') {
            return selectedPreset;
        }
        if (date?.from && date?.to) {
            return `${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d')}`;
        }
        if (date?.from) {
            return format(date.from, 'MMM d');
        }
        return 'Select';
    };

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setShowCalendar(false); }}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors',
                        className,
                    )}
                >
                    <CalendarDays className="size-3" />
                    <span>{getDisplayLabel()}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 border-zinc-700 bg-zinc-900" align="end">
                {!showCalendar ? (
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-1">
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    className={cn(
                                        'px-3 py-1.5 text-[11px] rounded-md transition-colors text-left',
                                        'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
                                        selectedPreset === preset.label && 'bg-zinc-800 text-blue-400',
                                    )}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <button
                            className="w-full px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 border-t border-zinc-800 mt-1 pt-2"
                            onClick={() => setShowCalendar(true)}
                        >
                            Custom range...
                        </button>
                    </div>
                ) : (
                    <div>
                        <Calendar
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={1}
                        />
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                            <button
                                className="text-[11px] text-zinc-500 hover:text-zinc-300"
                                onClick={() => setShowCalendar(false)}
                            >
                                ← Back
                            </button>
                            <Button
                                size="sm"
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                                onClick={() => setOpen(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
