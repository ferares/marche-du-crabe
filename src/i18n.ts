import { notFound } from "next/navigation"

import { getRequestConfig } from "next-intl/server"

import { type LocaleOption, locales } from "./i18nConfig"

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as LocaleOption)) notFound()
  const messages = (await import(`../langs/${locale}.json`)) as { default: IntlMessages }
  return { messages: messages.default }
})