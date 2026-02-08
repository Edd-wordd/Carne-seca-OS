// middleware.js
// Assigns a persistent guest ID to anonymous users on shop/cart/checkout routes
// so the app can track their cart/session without requiring login.
import { NextResponse } from "next/server";

// Only run this middleware on these routes (avoids touching every request).
export const config = {
  matcher: ["/shop/:path*", "/cart", "/checkout"],
};

export function middleware(request) {
  const cookieName = "guest_id";
  const guestId = request.cookies.get(cookieName)?.value;

  // Already has a guest ID — pass through with no changes.
  if (guestId) return NextResponse.next();

  // New visitor: generate a unique ID for this guest.
  const newGuestId = crypto.randomUUID();

  // 1. Prepare the request headers for the rest of the app (Server Components, etc.)
  //    We add the new cookie to the existing Cookie header so we don't overwrite
  //    other cookies (e.g. session, analytics).
  const requestHeaders = new Headers(request.headers);
  const existingCookie = request.headers.get("cookie") ?? "";
  requestHeaders.set(
    "cookie",
    existingCookie
      ? `${existingCookie}; ${cookieName}=${newGuestId}`
      : `${cookieName}=${newGuestId}`,
  );

  // 2. Create the response and forward the request with the updated headers
  //    so downstream code can read guest_id from cookies.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 3. Set the cookie on the response so the browser stores it for future requests.
  //    maxAge: 7 days | httpOnly: not readable by JS (security) | path: site-wide.
  response.cookies.set(cookieName, newGuestId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    path: "/",
  });

  return response;
}
