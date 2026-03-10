'use client';

import posthog from 'posthog-js';

export function usePosthogCapture(componentName) {
    function capture(nameEvent, data) {
        posthog.capture(nameEvent, {
            ...data,
            layer: 'client',
            component: componentName,
        });
    }
    return capture;
}
