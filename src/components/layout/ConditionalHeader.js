"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps children and optionally shows the store header.
 * The storeHeader is passed as a prop from the Server Component parent,
 * so we never import server-only code (CartCounter, supabase, next/headers)
 * into this client bundle.
 */
export default function ConditionalHeader({ storeHeader, children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    return (
        <>
            {!isAdmin && storeHeader}
            {children}
        </>
    );
}
