import { type Pathnames, type LocalePrefix } from "next-intl/routing"

import { type getPathname } from "./navigation"

type DotPrefix<T extends string, U extends string> = `${T}.${U}`

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string)]: ObjectType[Key] extends object ? DotPrefix<Key & string, NestedKeyOf<ObjectType[Key]>> : Key
}[keyof ObjectType & (string)]

type QueryParams = Record<string, string | Record<(typeof locales)[number], string>>

export type TranslationKey = NestedKeyOf<IntlMessages>

export type TranslationFunction = (key: TranslationKey, ...params: unknown[]) => string

export type Href = Parameters<typeof getPathname>[0]["href"]

export type LocaleOption = typeof locales[number]

export const defaultLocale = "en"

// These options are used everywhere except on middleware.ts,
// if adding/removing locales make sure to update that file manually
export const locales = ["es", "en"] as const

export const labels: { [code in (typeof locales)[number]]: string } = { "es": "Español", "en": "English" }

// All routes should be added here and then rewrites configured on next.config.mjs
export const pathnames = {
  "/": "/",
  "/[code]": {
    es: "/[code]",
    en: "/[code]",
  },
} satisfies Pathnames<typeof locales>

export const queryParams = {} satisfies QueryParams

export const localePrefix: LocalePrefix<typeof locales> = "always"

export const port = process.env.PORT ?? 3000
export const host = process.env.APP_URL ? `${process.env.APP_URL}` : `http://localhost:${port}`