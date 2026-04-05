import { auth } from '@clerk/nextjs/server';

export function withAuth(fn) {
    return async function (...args) {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized: No user ID found.');
        }
        return await fn(...args, { userId });
    };
}
