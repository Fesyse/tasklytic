"use server"

import { LOCALE_COOKIE_NAME } from "@/lib/locale"
import { cookies } from "next/headers"

export async function setUserLocale(locale: string) {
  ;(await cookies()).set(LOCALE_COOKIE_NAME, locale)
}
