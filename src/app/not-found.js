import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">404</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
            <p className="max-w-md text-pretty text-muted-foreground">
                That link doesn&apos;t exist or may have been moved. Head back to the shop to keep browsing.
            </p>
            <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Back to home
            </Link>
        </div>
    );
}
