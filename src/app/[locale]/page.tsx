import { getTranslations, unstable_setRequestLocale } from "next-intl/server"

import { type LocaleOption } from "@/i18nConfig"

import NewGameBtn from "@/components/NewGameBtn"
import Button from "@/components/Button"

interface HomeProps { params: { locale: LocaleOption } }

export default async function Home({ params: { locale } }: HomeProps) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations({ locale })
  return (
    <main className="main-content">
      <section className="intro">
        <h1 className="home-title">
          Game based on &quot;La Marche du Crabe&quot;
        </h1>
        <div className="home-actions">
          <NewGameBtn />
          <Button href={{ pathname: "/tutorial" }}>
            {t("Labels.tutorial")}
          </Button>
        </div>
      </section>
    </main>
  );
}
