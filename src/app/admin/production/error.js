'use client';

import { useEffect } from 'react';
import { useSentryCapture } from '@/lib/sentry/use-sentry-capture';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductionError({ error, reset }) {
    const { captureError } = useSentryCapture('ProductionError');
    useEffect(() => {
        captureError(error);
    }, [error]);
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
            <div className="flex flex-col items-center justify-center gap-4 max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 px-8 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                    <AlertCircle className="size-6 text-red-400" />
                </span>
                <div>
                    <h2 className="text-lg font-medium text-zinc-100">Something went wrong</h2>
                    <p className="mt-1 text-sm text-zinc-400">Production data failed to load. This has been reported.</p>
                </div>
                {error?.message && (
                    <p className="text-xs text-zinc-500 font-mono bg-zinc-950 px-3 py-2 rounded w-full">
                        {error.message}
                    </p>
                )}
                <Button
                    onClick={reset}
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
