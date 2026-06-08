import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { parseAdminSessionCookie } from "@/lib/auth";

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
  "/api/admin/login(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(request)) {
    return;
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/")
  ) {
    const cookieValue = request.cookies.get("calenzo_admin_session")?.value;
    if (cookieValue) {
      const payload = parseAdminSessionCookie(cookieValue);
      if (payload) return;
    }

    if (pathname.startsWith("/api/admin/")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Admin session required." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
