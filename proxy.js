import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/admin/login(.*)",
  "/patient/login(.*)",
  "/patient/register(.*)",
  "/services(.*)",
  "/contact(.*)",
  "/queue(.*)",
  "/ticket(.*)",
  "/auth(.*)",
  "/access-denied(.*)",
  "/api/health(.*)",
  "/api/ai/chat(.*)",
  "/api/webhooks(.*)",
  "/api/queue/stream(.*)",
  "/api/admin/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  // Always allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Allow admin routes if there's an admin session cookie
  if (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    request.cookies.has("calenzo_admin_session")
  ) {
    return;
  }

  // Otherwise require Clerk authentication
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
