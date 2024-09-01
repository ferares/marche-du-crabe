"use client"

import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"

import { useRef, useState } from "react"

import { useLocale, useTranslations } from "next-intl"

import { locales, labels, type LocaleOption, queryParams } from "@/i18nConfig"

import { usePathname, useRouter } from "@/navigation"

import Dropdown from "./Dropdown"

export default function LangMenu() {
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const locale = useLocale() as LocaleOption
  const t = useTranslations()

  function changeLocale(localeOption: LocaleOption) {
    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      let localizedKey = key
      for (const paramKey of Object.keys(queryParams)) {
        if (queryParams[paramKey as keyof typeof queryParams][locale] === key) {
          localizedKey = queryParams[paramKey as keyof typeof queryParams][localeOption]
          break
        }
      }
      query[localizedKey] = value
    })
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params, query },
      { locale: localeOption },
    )
  }

  return (
    <>
      <button ref={btnRef} id="button-lang" type="button" aria-controls="dropdown-lang" title={t("Labels.change-language")} className="language-button" aria-expanded={open} onClick={() => setOpen((open) => !open)}>
        <Image className="img-fluid" src={`/icons/language.svg`} alt="" height="20" width="20" />
      </button>
      <Dropdown id="dropdown-lang" open={open} onClose={() => setOpen(false)} togglerRef={btnRef}>
        <ul role="menu" aria-labelledby="button-lang">
          {locales.map((localeOption, index) => {
            if (localeOption === locale) return null
            return (
              <li role="menuitem" key={index}>
                <button type="button" onClick={() => changeLocale(localeOption)}>
                  <span lang={localeOption}>
                    {labels[localeOption]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Dropdown>
    </>
  )
}