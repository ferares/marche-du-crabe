import { type NextRequest } from "next/server"

import createMiddleware from "next-intl/middleware"

import { defaultLocale, locales, pathnames, localePrefix } from "./i18nConfig"

const intlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
  pathnames,
})

export default function Middleware(request: NextRequest) {
  const url = new URL(request.url)
  request.headers.set("x-pathname", url.pathname)
  const response = intlMiddleware(request)
  return response
}

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    {
      source: "/((?!api|_next/static|_next/image|_next|_vercel|.*\\..*|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};