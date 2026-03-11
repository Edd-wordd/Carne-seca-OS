'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils/helpers';

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col relative',
                month: 'space-y-4',
                month_caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium text-white',
                nav: 'flex items-center justify-between absolute inset-x-0',
                button_previous:
                    'absolute left-1 h-7 w-7 bg-zinc-800 border border-zinc-600 rounded p-0 flex items-center justify-center text-white hover:bg-zinc-700 z-10',
                button_next:
                    'absolute right-1 h-7 w-7 bg-zinc-800 border border-zinc-600 rounded p-0 flex items-center justify-center text-white hover:bg-zinc-700 z-10',
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday: 'text-white font-medium rounded-md w-9 text-xs text-center',
                weeks: 'w-full',
                week: 'flex w-full mt-2',
                day: 'h-9 w-9 text-center text-sm p-0 relative',
                day_button:
                    'h-9 w-9 p-0 font-normal text-white hover:bg-zinc-700 hover:text-white rounded-md inline-flex items-center justify-center aria-selected:opacity-100',
                range_end: 'day-range-end',
                range_start: 'day-range-start',
                selected:
                    'bg-blue-600 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white',
                today: 'bg-zinc-700 text-white font-semibold',
                outside: 'text-zinc-500 aria-selected:bg-zinc-800/50 aria-selected:text-zinc-400',
                disabled: 'text-zinc-600 opacity-50',
                range_middle: 'aria-selected:bg-zinc-800 aria-selected:text-zinc-200',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) =>
                    orientation === 'left' ? (
                        <ChevronLeft className="h-4 w-4 text-white" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-white" />
                    ),
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
