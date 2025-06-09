import { LOCALE_COOKIE_NAME } from "@/lib/locale"
import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as "en" | "ru")) {
    const newLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value

    locale = newLocale ?? routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
