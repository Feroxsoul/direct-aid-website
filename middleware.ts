import { type NextRequest } from "next/server";
import { ADMIN_LANG_COOKIE, parseAdminLang } from "@/lib/admin-lang-cookie";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminLang = parseAdminLang(request.cookies.get(ADMIN_LANG_COOKIE)?.value);
    response.headers.set("x-admin-lang", adminLang);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
