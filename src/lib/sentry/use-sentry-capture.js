'use client';

import * as Sentry from '@sentry/nextjs';

export function useSentryCapture(componentName) {
    function captureError(err) {
        Sentry.captureException(err, {
            tags: {
                layer: 'client',
                component: componentName,
            },
        });
    }

    function captureMessage(message) {
        Sentry.captureMessage(message, {
            level: 'warning',
            tags: {
                layer: 'client',
                component: componentName,
            },
        });
    }

    return { captureError, captureMessage };
}
