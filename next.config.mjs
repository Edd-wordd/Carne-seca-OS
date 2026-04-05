import path from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    async redirects() {
        return [
            { source: '/admin/orders', destination: '/admin/finance/orders', permanent: true },
            { source: '/admin/expenses', destination: '/admin/finance/expenses', permanent: true },
            { source: '/admin/payouts', destination: '/admin/finance/payouts', permanent: true },
            { source: '/admin/pnl', destination: '/admin/finance/pnl', permanent: true },
            { source: '/admin/customers', destination: '/admin/customers/directory', permanent: true },
            { source: '/admin/campaigns', destination: '/admin/customers/campaigns', permanent: true },
            { source: '/admin/production', destination: '/admin/operations/production', permanent: true },
            { source: '/admin/inventory', destination: '/admin/operations/inventory', permanent: true },
            { source: '/admin/supplies', destination: '/admin/operations/supplies', permanent: true },
            { source: '/admin/catalog', destination: '/admin/operations/catalog', permanent: true },
            { source: '/admin/coupons', destination: '/admin/operations/coupons', permanent: true },
            { source: '/admin/markets-events', destination: '/admin/events', permanent: true },
            { source: '/admin/social', destination: '/admin/social/post-manager', permanent: false },
            { source: '/admin/documents', destination: '/admin/documents/contracts', permanent: false },
        ];
    },
    webpack: (config) => {
        config.resolve.modules = [
            path.resolve(__dirname, 'node_modules'),
            ...(config.resolve.modules || ['node_modules']),
        ];
        return config;
    },
};

export default withSentryConfig(nextConfig, {
    org: 'eddwordd',
    project: 'carne-seca-os',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    automaticVercelMonitors: true,
});
