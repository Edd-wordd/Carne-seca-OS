'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function PosthogProvider({ children }) {
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            defaults: '2026-01-30',
        });
    }, []);

    return children;
}
