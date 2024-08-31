import "../../styles/app.css"

import type { Metadata } from "next"
import { Caveat, Fuzzy_Bubbles } from 'next/font/google'

import { NextIntlClientProvider } from "next-intl"
import { getMessages, unstable_setRequestLocale } from "next-intl/server"

import { AlertsProvider } from "@/context/Alerts"
import { LoaderProvider } from "@/context/Loader"

import { type LocaleOption } from "@/i18nConfig"

const caveat = Caveat({ subsets: ['latin'], display: 'swap', variable: "--font-caveat" })
const fuzzyBubbles = Fuzzy_Bubbles({ subsets: ['latin'], weight: ["400"], display: 'swap', variable: "--font-fuzzy-bubbles" })

export const metadata: Metadata = {
  title: "La Marche du Crabe",
  robots: { follow: false, index: false },
}

interface RootLayoutProps { params: { locale: LocaleOption }, children: React.ReactNode }

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <html lang={locale} className={`${caveat.variable} ${fuzzyBubbles.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AlertsProvider>
            <LoaderProvider>
              {children}
            </LoaderProvider>
          </AlertsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
