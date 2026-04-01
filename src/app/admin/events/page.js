'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarClock, Plus } from 'lucide-react';

const MOCK_UPCOMING = [
    {
        id: 'me-1',
        name: "SFC Farmers' Market — Downtown",
        date: '2026-04-06',
        time: '9:00 AM – 2:00 PM',
        location: 'Austin, TX',
        booth: 'A14',
        status: 'confirmed',
    },
    {
        id: 'me-2',
        name: 'Night Market — Eastside',
        date: '2026-04-12',
        time: '5:00 PM – 10:00 PM',
        location: 'Austin, TX',
        booth: 'Food row',
        status: 'applied',
    },
];

export default function EventsCalendarPage() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-zinc-100 text-xl font-semibold tracking-tight">
                        Calendar{' '}
                        <span className="font-normal text-zinc-500">
                            — upcoming events, markets, pop-ups you&apos;re attending
                        </span>
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm">Mock UI only.</p>
                </div>
                <Button size="sm" disabled className="h-9 gap-1.5 bg-indigo-500/20 text-indigo-300 opacity-60">
                    <Plus className="size-3.5" />
                    Add event
                </Button>
            </div>

            <div className="max-w-xs">
                <Card className="border-zinc-800 bg-zinc-900/70">
                    <CardContent className="flex items-start justify-between p-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Upcoming (mock)</p>
                            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
                                {MOCK_UPCOMING.length}
                            </p>
                        </div>
                        <CalendarClock className="mt-0.5 size-4 text-amber-400/80" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-100">Upcoming</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">
                        Markets, pop-ups, and events on your calendar
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Event</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Date</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Time</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Location</TableHead>
                                <TableHead className="h-8 px-3 text-[10px] text-zinc-500">Booth</TableHead>
                                <TableHead className="h-8 px-4 text-[10px] text-zinc-500">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_UPCOMING.map((e) => (
                                <TableRow key={e.id} className="border-zinc-800/80">
                                    <TableCell className="px-4 py-2">
                                        <p className="text-[11px] font-medium text-zinc-200">{e.name}</p>
                                        <p className="font-mono text-[10px] text-zinc-600">{e.id}</p>
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{e.date}</TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{e.time}</TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{e.location}</TableCell>
                                    <TableCell className="px-3 py-2 text-[11px] text-zinc-400">{e.booth}</TableCell>
                                    <TableCell className="px-4 py-2 text-[10px] capitalize text-zinc-500">
                                        {e.status}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
