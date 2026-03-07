import * as Sentry from '@sentry/nextjs';

export function withSentryAction(actionName, fn) {
    return async function (...args) {
        try {
            return await fn(...args);
        } catch (err) {
            Sentry.captureException(err, {
                tags: {
                    layer: 'server-action',
                    action: actionName,
                },
            });
            throw err;
        }
    };
}
