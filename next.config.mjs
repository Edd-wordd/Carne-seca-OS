import path from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    async redirects() {
        return [
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
