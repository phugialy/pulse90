import { NextResponse, type NextRequest } from "next/server";

const CLOSED_PATHS = [
  "/api/sync",
  "/fixtures",
  "/golden-boot",
  "/groups",
  "/install",
  "/matches",
  "/predictions",
  "/results",
  "/teams",
  "/updates",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shouldClose = CLOSED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!shouldClose) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        status: "closed",
        message: "Pulse90 live data services have retired.",
      },
      { status: 410 },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("from", "archive");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/api/sync/:path*",
    "/fixtures/:path*",
    "/golden-boot/:path*",
    "/groups/:path*",
    "/install/:path*",
    "/matches/:path*",
    "/predictions/:path*",
    "/results/:path*",
    "/teams/:path*",
    "/updates/:path*",
  ],
};
