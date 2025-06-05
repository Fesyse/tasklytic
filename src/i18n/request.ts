import { LOCALE_COOKIE_NAME } from "@/lib/locale"
import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export default getRequestConfig(async () => {
  const locale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value ?? "en" // Default to English

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
